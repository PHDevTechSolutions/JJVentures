import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";

// Function to add an account directly in this file
async function addContainer({ ReferenceNumber, SpsicNo, DateArrived, DateSoldout, SupplierName, ContainerNo, ContainerType, Country, Boxes, TotalQuantity, TotalGrossSales, Commodity, Size, Freezing, Status, BoxType, Remarks, userName, Location, PlaceSales }: {
  ReferenceNumber: string;
  SpsicNo: string;
  DateArrived: string;
  DateSoldout: string;
  SupplierName: string;
  ContainerNo: string;
  Country: string;
  Boxes: string;
  TotalQuantity: string;
  TotalGrossSales: string;
  Commodity: string;
  Size: string;
  Freezing: string;
  Status: string;
  BoxType: string;
  Remarks: string;
  userName: string;
  Location: string;
  ContainerType: string;
  PlaceSales: string;

}) {
  const db = await connectToDatabase();
  const containerCollection = db.collection("container");

  // Create container data
  const newData = { ReferenceNumber, SpsicNo, DateArrived, DateSoldout, SupplierName, ContainerNo, ContainerType, Country, Boxes, TotalQuantity, TotalGrossSales, Commodity, Size, Location, Freezing, Status, BoxType, Remarks, PlaceSales, createdAt: new Date() };

  // Insert new container data into the container collection
  await containerCollection.insertOne(newData);

  // Log activity data into the ActivityLogs collection
  const activityLog = {
    userName: userName, 
    Location: Location, 
    SpsicNo: SpsicNo, 
    message: `${userName} Has Been Created Container Number: ${ContainerNo}`,
    ContainerNo: ContainerNo, 
    Boxes: Boxes, 
    createdAt: new Date(),
  };

  const activityCollection = db.collection("ActivityLogs");
  await activityCollection.insertOne(activityLog);

  // Broadcast logic if needed
  if (typeof io !== "undefined" && io) {
    io.emit("newData", newData);
  }

  return { success: true };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { ReferenceNumber, SpsicNo, DateArrived, DateSoldout, SupplierName, ContainerNo, ContainerType, Country, Boxes, TotalQuantity, TotalGrossSales, Commodity, Size, Freezing, Status, BoxType, Remarks, userName, Location, PlaceSales } = req.body;

    // Validate required fields
    if (!ContainerNo || !SpsicNo) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    try {
      const result = await addContainer({ ReferenceNumber, SpsicNo, DateArrived, DateSoldout, SupplierName, ContainerNo, ContainerType, Country, Boxes, TotalQuantity, TotalGrossSales, Commodity, Size, Freezing, Status, BoxType, Remarks, userName, Location, PlaceSales });
      res.status(200).json(result);
    } catch (error) {
      console.error("Error adding container:", error);
      res.status(500).json({ success: false, message: "Error adding container", error });
    }
  } else {
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
}
