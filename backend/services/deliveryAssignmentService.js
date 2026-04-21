const db = require("../config/db");
const OrderModel = require("../models/orderModel");

const DeliveryAssignmentService = {
    /**
     * Haversine formula to calculate distance between two points in km.
     */
    calculateDistance(lat1, lon1, lat2, lon2) {
        if (!lat1 || !lon1 || !lat2 || !lon2) return 9999;
        const R = 6371; // Radius of the earth in km
        const dLat = (lat2 - lat1) * (Math.PI / 180);
        const dLon = (lon2 - lon1) * (Math.PI / 180);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
    },

    /**
     * Find the nearest available delivery partner for an order.
     */
    async findNearestPartner(orderId, excludedIds = []) {
        // 1. Get order target location (buyer address / lat-lng)
        // Note: For now we assume the location is on the USER table.
        const [order] = await db.query(
            "SELECT u.lat, u.lng FROM orders o JOIN users u ON o.buyer_id = u.id WHERE o.id = ?",
            [orderId]
        );
        if (!order || !order[0]?.lat) return null;

        const { lat, lng } = order[0];

        // 2. Fetch all available delivery partners
        const [partners] = await db.query(
            "SELECT id, name, lat, lng FROM users WHERE role = 'delivery' AND is_available = 1"
        );

        if (!partners.length) return null;

        // 3. Filter out excluded partners and calculate distances
        const candidates = partners
            .filter(p => !excludedIds.includes(p.id))
            .map(p => ({
                ...p,
                distance: this.calculateDistance(lat, lng, p.lat, p.lng)
            }))
            .sort((a, b) => a.distance - b.distance);

        return candidates.length > 0 ? candidates[0] : null;
    },

    /**
     * Automatically assign a partner to an order.
     */
    async autoAssign(orderId) {
        const partner = await this.findNearestPartner(orderId);
        if (partner) {
            await db.query(
                "UPDATE orders SET delivery_person_id = ?, status = 'Accepted' WHERE id = ?",
                [partner.id, orderId]
            );
            return partner;
        } else {
            return null;
        }
    }
};

module.exports = DeliveryAssignmentService;
