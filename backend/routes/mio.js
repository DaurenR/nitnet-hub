const express = require("express");
const { PrismaClient } = require("@prisma/client");

const router = express.Router();
const prisma = new PrismaClient();

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
        { provider: { contains: q, mode: "insensitive" } },
        { serviceName: { contains: q, mode: "insensitive" } },
      ];

    const channels = await prisma.mioChannel.findMany({
      where: filters,
      orderBy: sort ? { [sort]: order === 'desc' ? 'desc' : 'asc' } : undefined,
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

    const updatedChannel = await prisma.mioChannel.update({
      where: { id },
      data: {
        provider: data.provider,
        serviceName: data.serviceName,
        ipAddress: data.ipAddress,
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
    const newChannel = await prisma.mioChannel.create({
      data: {
        provider: req.body.provider,
        serviceName: req.body.serviceName,
        ipAddress: req.body.ipAddress,
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