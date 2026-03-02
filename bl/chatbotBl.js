var chatbotDl = require(__base + "/dl/chatbotDl.js");
var authDl = require(__base + "/dl/authDl.js");

function ChatbotBl() {
    this.askChatbot = async function (req) {
        // 1. Extract user details from token
        let user_details = await authDl.getDecryptToken(req);
        // console.log(user_details)
        let org_id = user_details.org_id;
        let user_id = user_details.user_id;

        // 2. Validate request body
        const { question } = req.body;
        console.log(req.body)
        if (!question) {
            return { status: "error", message: "question is required" };
        }

        // 3. Call DL to forward to Python service
        let chatbotResponse = await chatbotDl.sendToPython(user_id, org_id, question);

        // 4. Prepare final response
        return {
            data: chatbotResponse,
        };
    };
}

// export instance
module.exports = new ChatbotBl();