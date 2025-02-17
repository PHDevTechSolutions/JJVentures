import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../../lib/mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { location, role } = req.query; // Extract role and location from the query

  try {
    const db = await connectToDatabase();
    const containerCollection = db.collection("container_order");

    // Extract the month and year from query parameters (default to 'All' if not provided)
    const { month, year } = req.query;
    
    // Get today's date in the format YYYY-MM-DD
    const today = new Date().toISOString().split('T')[0];

    // Build the date filter based on selected month and year
    let dateFilter = {};

    if (month !== "All" && year !== "All") {
      // Construct a date range for the selected month and year
      const startDate = new Date(`${year}-${month}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1); // Set the end date to the next month

      dateFilter = {
        DateOrder: {
          $gte: startDate.toISOString(),
          $lt: endDate.toISOString(),
        },
      };
    } else if (year !== "All") {
      // If only year is selected, filter by year
      const yearInt = parseInt(year as string); // Ensure year is a number
      const startDate = new Date(`${yearInt}-01-01`);
      const endDate = new Date(`${yearInt + 1}-01-01`);
      
      dateFilter = {
        DateOrder: {
          $gte: startDate.toISOString(),
          $lt: endDate.toISOString(),
        },
      };
    } else if (month !== "All") {
      // If only month is selected, filter by month across all years
      const startDate = new Date(`2000-${month}-01`);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + 1); // Set the end date to the next month

      dateFilter = {
        DateOrder: {
          $gte: startDate.toISOString(),
          $lt: endDate.toISOString(),
        },
      };
    } else {
      // Default to today if no filters are applied
      dateFilter = {
        DateOrder: today, // Filter by today's date
      };
    }

    const matchCondition: any = { PaymentMode: "Cash", ...dateFilter, };

    if (location === "Philippines") {
      // No location filter applied, showing data from all locations
      // Do nothing in terms of filtering Location here
    } else if (location && location !== "All") {
      // Apply location filter if specified and not "All"
      matchCondition.Location = location;
    }

    // Check if user is Super Admin or Director
    if (role === "Super Admin" || role === "Directors") {
      // Super Admin and Directors can see all locations if "All" is selected
      if (location && location !== "All" && location !== "Philippines") {
        // Apply location filter if a location other than 'Philippines' is specified
        matchCondition.Location = location;
      }
    } else {
      // For other roles (Admin, Staff, etc.), restrict by location if not "All"
      if (location && location === "All") {
        // Show all locations if "All" is selected for other roles
        // No additional filter is added, so all locations will be included
      } else if (location && location !== "Philippines") {
        // Apply location filter for other roles if a specific location is selected
        matchCondition.Location = location;
      }
    }

    // Aggregate GrossSales per DateOrder, filtering by PaymentMode and the selected date filter
    const result = await containerCollection.aggregate([
      { $match: matchCondition },
      {
        $addFields: {
          GrossSales: { $toDouble: "$GrossSales" }, // Convert GrossSales to a double (number)
        },
      },
      {
        $group: {
          _id: null, // No grouping by DateOrder, just sum the GrossSales
          totalGrossSalesToday: { $sum: "$GrossSales" }, // Sum GrossSales for the selected date range
        },
      },
    ]).toArray();

    // If there are results, get the total GrossSales for the filtered period; otherwise, set it to 0
    const totalGrossSalesToday = result.length > 0 ? result[0].totalGrossSalesToday : 0;

    res.status(200).json({ totalGrossSalesToday });
  } catch (error) {
    console.error("Error fetching sales data:", error);
    res.status(500).json({ success: false, message: "Error fetching sales data", error });
  }
}
