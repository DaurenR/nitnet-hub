const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

app.get("/channels", async (req, res) => {
  try {
    const { provider, agency, region, sort, skip = 0, take = 10 } = req.query;

    const filters = {};
    if (provider) filters.provider = provider;
    if (agency) filters.agencyName = agency;
    if (region) filters.region = region;

    const channels = await prisma.channels.findMany({
      where: filters,
      orderBy: sort ? { [sort]: "asc" } : undefined,
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

app.get("/channels/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const channel = await prisma.channels.findUnique({
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

app.put("/channels/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;

    const updatedChannel = await prisma.channels.update({
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

app.post("/channels", async (req, res) => {
  try {
    const newChannel = await prisma.channels.create({
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

app.delete("/channels/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.channels.delete({
      where: { id: BigInt(id) }, // потому что id — BigInt в базе
    });
    res.status(200).json({ message: "Channel deleted successfully" });
  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});
