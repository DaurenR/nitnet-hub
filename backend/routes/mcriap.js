const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    const { provider, agency, region, sort, order } = req.query;
    const q = req.query.q?.toString();
    const page = Number(req.query.page) || 1;
    const perPage = Number(req.query.perPage) || 10;
    const skip = (page - 1) * perPage;

    const filters = {};
    if (provider) filters.provider = provider;
    if (agency) filters.agencyName = agency;
    if (region) filters.region = region;
     if (q)
      filters.OR = [
        { agencyName: { contains: q, mode: "insensitive" } },
        { provider: { contains: q, mode: "insensitive" } },
        { region: { contains: q, mode: "insensitive" } },
      ];

    const channels = await prisma.mcriapChannel.findMany({
      where: filters,
      orderBy: sort ? { [sort]: order === 'desc' ? 'desc' : 'asc' } : undefined,
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
        manager: data.manager,
        updatedBy: data.updatedBy,
        updatedAt: new Date(),
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
    const newChannel = await prisma.mcriapChannel.create({
      data: {
        network: req.body.network,
        agencyName: req.body.agencyName,
        physicalAddress: req.body.physicalAddress,
        serviceName: req.body.serviceName,
        bandwidthKbps: req.body.bandwidthKbps,
        tariffPlan: req.body.tariffPlan,
        connectionType: req.body.connectionType,
        provider: req.body.provider,
        region: req.body.region,
        ipAddress: req.body.ipAddress,
        p2pIp: req.body.p2pIp,
        manager: req.body.manager,
        updatedBy: req.body.updatedBy,
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