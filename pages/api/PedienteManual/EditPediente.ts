import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function editAccount(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PUT') {
        res.setHeader('Allow', ['PUT']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
        return;
    }

    const { id, BuyersName, DateOrder, PlaceSales, ContainerNo, Commodity, Size, BoxSales, Price, GrossSales, PayAmount, Status, BalanceAmount, Location } = req.body;

    try {
        const db = await connectToDatabase();
        const containerCollection = db.collection('container_order');
        const updatedAccount = {
            DateOrder, BuyersName, PlaceSales, ContainerNo, Commodity, Size, BoxSales, Price, GrossSales, PayAmount, Status, Location, BalanceAmount, updatedAt: new Date(),
        };

        // Update container data
        await containerCollection.updateOne({ _id: new ObjectId(id) }, { $set: updatedAccount });


        res.status(200).json({ success: true, message: 'Data updated successfully' });
    } catch (error) {
        console.error('Error updating Data:', error);
        res.status(500).json({ error: 'Failed to update Data' });
    }
}
