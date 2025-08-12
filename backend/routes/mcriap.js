const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

router.get("/", async (req, res) => {
  try {
    const { provider, agency, region, sort, order, skip = 0, take = 10 } = req.query;

    const filters = {};
    if (provider) filters.provider = provider;
    if (agency) filters.agencyName = agency;
    if (region) filters.region = region;

    const channels = await prisma.mciriapChannel.findMany({
      where: filters,
      orderBy: sort ? { [sort]: order === 'desc' ? 'desc' : 'asc' } : undefined,
      skip: Number(skip),
      take: Number(take),
    });

    const fixed = channels.map((channel) => ({
      ...channel,
      id: Number(channel.id),
    }));

    res.json(fixed);
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const channel = await prisma.mciriapChannel.findUnique({
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
  try {
    const id = Number(req.params.id);
    const data = req.body;

    const updatedChannel = await prisma.mciriapChannel.update({
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
  try {
    const newChannel = await prisma.mciriapChannel.create({
      data: {
        id: req.body.id,
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
  try {
    const { id } = req.params;
    await prisma.mciriapChannel.delete({
      where: { id: BigInt(id) },
    });
    res.status(200).json({ message: "Channel deleted successfully" });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;