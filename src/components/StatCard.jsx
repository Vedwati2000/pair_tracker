import { motion } from "framer-motion";

function StatCard({ title, value, subtitle }) {
    return (
        <motion.div
            className="col-md-6 col-xl-3 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="card stat-card h-100 border-0 shadow-sm">
                <div className="card-body p-4">
                    <p className="text-muted mb-2">{title}</p>

                    <h2 className="fw-bold mb-2">{value}</h2>

                    <small className="text-secondary">
                        {subtitle}
                    </small>
                </div>
            </div>
        </motion.div>
    );
}

export default StatCard;