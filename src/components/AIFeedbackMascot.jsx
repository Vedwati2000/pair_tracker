
import { useEffect } from "react";
import { motion } from "framer-motion";
import "./AIFeedbackMascot.css";

function AIFeedbackMascot({ mood = "idle", message = "Ready to learn together?" }) {
    useEffect(() => {
        return () => {
            window.speechSynthesis?.cancel();
        };
    }, []);

    const expressions = {
        idle: "◕‿◕",
        listening: "◉‿◉",
        thinking: "◔_◔",
        speaking: "◕ᴗ◕",
        excited: "★ᴗ★"
    };

    return (
        <div className={`mascot-container mascot-${mood}`}>
            <motion.div
                className="mascot-character"
                animate={
                    mood === "excited"
                        ? { y: [0, -12, 0], rotate: [0, 5, -5, 0] }
                        : mood === "listening"
                        ? { scale: [1, 1.04, 1] }
                        : mood === "thinking"
                        ? { rotate: [0, -4, 4, 0] }
                        : { y: [0, -5, 0] }
                }
                transition={{
                    duration: mood === "excited" ? 0.6 : 1.8,
                    repeat: mood === "idle" ? Infinity : 2
                }}
            >
                <div className="mascot-ears">
                    <span />
                    <span />
                </div>

                <div className="mascot-face">
                    <div className="mascot-eyes">
                        <span />
                        <span />
                    </div>

                    <div className="mascot-expression">
                        {expressions[mood] || expressions.idle}
                    </div>

                    <div className="mascot-mouth" />
                </div>

                <div className="mascot-body">
                    <span className="mascot-badge">AI</span>
                </div>
            </motion.div>

            <div className="mascot-message">
                {message}
            </div>
        </div>
    );
}

export default AIFeedbackMascot;
