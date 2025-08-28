const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();
const ipRegex = /^\d{1,3}(\.\d{1,3}){3}(\/\d{1,2})?$/;

router.get("/", async (req, res) => {
  try {
    const { provider, serviceName, sort, order } = req.query;
    const q = req.query.q?.toString();
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;
    const skip = (page - 1) * perPage;

    const filters = {};
    if (provider) filters.provider = provider;
    if (serviceName) filters.serviceName = serviceName;
    if (q)
      filters.OR = [
        { clientName: { contains: q, mode: "insensitive" } },
        { providerId: { contains: q, mode: "insensitive" } },
        { repOfficeName: { contains: q, mode: "insensitive" } },
      ];

      const allowedSort = [
      "serviceName",
      "provider",
      "bandwidthKbps",
      "clientName",
      "createdAt",
    ];
    const orderBy =
      sort && allowedSort.includes(sort)
        ? { [sort]: order === "desc" ? "desc" : "asc" }
        : undefined;

    const channels = await prisma.mioChannel.findMany({
      where: filters,
      orderBy,
      skip,
      take: perPage,
    });

    const total = await prisma.mioChannel.count({ where: filters });

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
    const channel = await prisma.mioChannel.findUnique({
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
      "clientName",
      "physicalAddress",
      "serviceName",
      "bandwidthKbps",
      "provider",
      "updatedBy",
    ];
    for (const field of required) {
      if (data[field] === undefined || data[field] === null || data[field] === "") {
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

    const updatedChannel = await prisma.mioChannel.update({
      where: { id },
      data: {
        repOfficeName: data.repOfficeName,
        clientName: data.clientName,
        endUser: data.endUser,
        physicalAddress: data.physicalAddress,
        serviceName: data.serviceName,
        bandwidthKbps: data.bandwidthKbps,
        tariffPlan: data.tariffPlan,
        provider: data.provider,
        connectionType: data.connectionType,
        providerId: data.providerId,
        ipAddress: data.ipAddress,
        p2pIp: data.p2pIp,
        providerVrf: data.providerVrf,
        manager: data.manager,
        updatedBy: data.updatedBy,
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
      "clientName",
      "physicalAddress",
      "serviceName",
      "bandwidthKbps",
      "provider",
      "updatedBy",
    ];
    for (const field of required) {
      if (data[field] === undefined || data[field] === null || data[field] === "") {
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
    const newChannel = await prisma.mioChannel.create({
      data: {
        repOfficeName: data.repOfficeName,
        clientName: data.clientName,
        endUser: data.endUser,
        physicalAddress: data.physicalAddress,
        serviceName: data.serviceName,
        bandwidthKbps: data.bandwidthKbps,
        tariffPlan: data.tariffPlan,
        provider: data.provider,
        connectionType: data.connectionType,
        providerId: data.providerId,
        ipAddress: data.ipAddress,
        p2pIp: data.p2pIp,
        providerVrf: data.providerVrf,
        manager: data.manager,
        updatedBy: data.updatedBy,
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
    await prisma.mioChannel.delete({
      where: { id },
    });
    res.status(200).json({ message: "Channel deleted successfully" });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;