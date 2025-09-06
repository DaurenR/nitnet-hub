const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();
const ipRegex = /^\d{1,3}(\.\d{1,3}){3}(\/\d{1,2})?$/;

function buildWhereForQ(fields, ipFields, q) {
  if (!q) return {};
  if (ipRegex.test(q)) {
    return {
      OR: ipFields.map((f) => ({
        [f]: { contains: q, mode: "insensitive" },
      })),
    };
  }
  const tokens = q.trim().split(/\s+/).filter(Boolean);
  return {
    AND: tokens.map((token) => ({
      OR: fields.map((f) => ({
        [f]: { contains: token, mode: "insensitive" },
      })),
    })),
  };
}

const searchFields = [
  "network",
  "agencyName",
  "physicalAddress",
  "serviceName",
  "provider",
  "region",
  "tariffPlan",
  "connectionType",
  "externalId",
  "ipAddress",
  "p2pIp",
  "manager",
];
const searchIpFields = ["ipAddress", "p2pIp"];

function buildWhere(params = {}) {
  const {
    provider,
    serviceName,
    agency,
    region,
    tariffPlan,
    connectionType,
    bandwidthMin,
    bandwidthMax,
    createdFrom,
    createdTo,
    ipPresent,
    q,
  } = params;

  const conditions = [];
  const toFilter = (field, value) => {
    if (value === undefined) return;
    conditions.push({
      [field]: Array.isArray(value) ? { in: value } : value,
    });
  };

  toFilter("provider", provider);
  toFilter("serviceName", serviceName);
  toFilter("agencyName", agency);
  toFilter("region", region);
  toFilter("tariffPlan", tariffPlan);
  toFilter("connectionType", connectionType);

  if (bandwidthMin || bandwidthMax) {
    const range = {};
    if (bandwidthMin) range.gte = Number(bandwidthMin);
    if (bandwidthMax) range.lte = Number(bandwidthMax);
    conditions.push({ bandwidthKbps: range });
  }

  if (createdFrom || createdTo) {
    const range = {};
    if (createdFrom) range.gte = new Date(createdFrom);
    if (createdTo) range.lte = new Date(createdTo);
    conditions.push({ createdAt: range });
  }

  if (ipPresent) {
    conditions.push({
      OR: [
        { ipAddress: { not: null } },
        { p2pIp: { not: null } },
      ],
    });
  }

  const qFilter = buildWhereForQ(searchFields, searchIpFields, q);
  if (Object.keys(qFilter).length) conditions.push(qFilter);

  if (conditions.length === 0) return {};
  if (conditions.length === 1) return conditions[0];
  return { AND: conditions };
}

router.get("/", async (req, res) => {
  try {
    const { sort, order } = req.query;
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;
    const skip = (page - 1) * perPage;

    const filters = buildWhere(req.query);

    const allowedSort = [
      "serviceName",
      "provider",
      "bandwidthKbps",
      "region",
      "createdAt",
    ];
    const orderBy =
      sort && allowedSort.includes(sort)
        ? { [sort]: order === "desc" ? "desc" : "asc" }
        : undefined;

    const channels = await prisma.mcriapChannel.findMany({
      where: filters,
      orderBy,
      skip,
      take: perPage,
    });

    const total = await prisma.mcriapChannel.count({ where: filters });

    const fixed = channels.map((channel) => ({
      ...channel,
      id: Number(channel.id),
    }));

    res.json({ data: fixed, total, page, perPage });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const channel = await prisma.mcriapChannel.findUnique({
      where: { id },
    });

    if (!channel) {
      return res.status(404).json({ error: "Channel not found" });
    }

    res.json({
      ...channel,
      id: Number(channel.id),
    });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.put("/:id", async (req, res) => {
  if (req.role !== "manager")
    return res.status(403).json({ message: "Forbidden" });
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const required = [
      "network",
      "agencyName",
      "physicalAddress",
      "serviceName",
      "bandwidthKbps",
      "provider",
    ];
    for (const field of required) {
      if (
        data[field] === undefined ||
        data[field] === null ||
        data[field] === ""
      ) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }
    if (data.bandwidthKbps <= 0)
      return res
        .status(400)
        .json({ error: "bandwidthKbps must be greater than 0" });
    if (data.ipAddress && !ipRegex.test(data.ipAddress))
      return res.status(400).json({ error: "Invalid ipAddress" });
    if (data.p2pIp && !ipRegex.test(data.p2pIp))
      return res.status(400).json({ error: "Invalid p2pIp" });

    const updatedChannel = await prisma.mcriapChannel.update({
      where: { id },
      data: {
        network: data.network,
        agencyName: data.agencyName,
        physicalAddress: data.physicalAddress,
        serviceName: data.serviceName,
        bandwidthKbps: data.bandwidthKbps,
        tariffPlan: data.tariffPlan,
        connectionType: data.connectionType,
        provider: data.provider,
        region: data.region,
        ipAddress: data.ipAddress,
        p2pIp: data.p2pIp,
        externalId: data.externalId,
        manager: data.manager,
      },
    });

    res.json({
      ...updatedChannel,
      id: Number(updatedChannel.id),
    });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/", async (req, res) => {
  if (req.role !== "manager")
    return res.status(403).json({ message: "Forbidden" });
  try {
    const data = req.body;
    const required = [
      "network",
      "agencyName",
      "physicalAddress",
      "serviceName",
      "bandwidthKbps",
      "provider",
    ];
    for (const field of required) {
      if (
        data[field] === undefined ||
        data[field] === null ||
        data[field] === ""
      ) {
        return res.status(400).json({ error: `${field} is required` });
      }
    }
    if (data.bandwidthKbps <= 0)
      return res
        .status(400)
        .json({ error: "bandwidthKbps must be greater than 0" });
    if (data.ipAddress && !ipRegex.test(data.ipAddress))
      return res.status(400).json({ error: "Invalid ipAddress" });
    if (data.p2pIp && !ipRegex.test(data.p2pIp))
      return res.status(400).json({ error: "Invalid p2pIp" });
    const newChannel = await prisma.mcriapChannel.create({
      data: {
        network: data.network,
        agencyName: data.agencyName,
        physicalAddress: data.physicalAddress,
        serviceName: data.serviceName,
        bandwidthKbps: data.bandwidthKbps,
        tariffPlan: data.tariffPlan,
        connectionType: data.connectionType,
        provider: data.provider,
        region: data.region,
        ipAddress: data.ipAddress,
        p2pIp: data.p2pIp,
        externalId: data.externalId,
        manager: data.manager,
      },
    });
    res.json({
      ...newChannel,
      id: Number(newChannel.id),
    });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.delete("/:id", async (req, res) => {
  if (req.role !== "manager")
    return res.status(403).json({ message: "Forbidden" });
  try {
    const id = Number(req.params.id);
    await prisma.mcriapChannel.delete({
      where: { id },
    });
    res.status(200).json({ message: "Channel deleted successfully" });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
