const axios = require("axios");

function ChatbotDl() {
    this.sendToPython = async function (user_id, org_id, question) {
        try {
            const res = await axios.post("http://localhost:5001/api/chat", {
                user_id,
                org_id,
                question,
            });
            return res.data;
        } catch (err) {
            console.error("Error calling Python chatbot:", err.message);
            return { error: "Python chatbot unavailable" };
        }
    };
}

// export instance
module.exports = new ChatbotDl();