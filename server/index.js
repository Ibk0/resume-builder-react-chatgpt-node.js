const { Configuration, OpenAIApi } = require("openai");
const express = require("express");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const fs = require("fs");
const app = express();
const PORT = 4000;

app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use(express.json());
app.use(cors());

const generateID = () => Math.random().toString(36).substring(2, 10);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 },
});

const configuration = new Configuration({
  apiKey: "Your-Secret-Key",
});

const openai = new OpenAIApi(configuration);

const database = [];

const ChatGPTFunction = async (prompt) => {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.6,
    max_tokens: 250,
    top_p: 1,
    frequency_penalty: 1,
    presence_penalty: 1,
  });
  return response.data.choices[0].message.content;
};

app.post("/resume/create", upload.single("headshotImage"), async (req, res) => {
  const {
    fullName,
    currentPosition,
    currentLength,
    currentTechnologies,
    workHistory,
  } = req.body;

  const workArray = JSON.parse(workHistory);
  const newEntry = {
    id: generateID(),
    fullName,
    image_url: `http://localhost:4000/uploads/${req.file.filename}`,
    currentPosition,
    currentLength,
    currentTechnologies,
    workHistory: workArray,
  };

  // Creating prompts for ChatGPT
  const prompt1 = `I am writing a resume, my details are \n name: ${fullName} \n role: ${currentPosition} (${currentLength} years). \n I work with technologies like: ${currentTechnologies}. Can you write a 100-word description for the top of the resume (in first person)?`;

  const prompt2 = `I am writing a resume, my details are \n name: ${fullName} \n role: ${currentPosition} (${currentLength} years). \n I work with technologies like: ${currentTechnologies}. Can you provide 10 points about what I am good at?`;

  const remainderText = () => {
    let stringText = "";
    for (let i = 0; i < workArray.length; i++) {
      stringText += ` ${workArray[i].name} as a ${workArray[i].position}.`;
    }
    return stringText;
  };

  const prompt3 = `I am writing a resume, my details are \n name: ${fullName} \n role: ${currentPosition} (${currentLength} years). \n During my career, I worked at ${
    workArray.length
  } companies. ${remainderText()} \n Can you write 50 words about my achievements at each company (in first person)?`;

  const objective = await ChatGPTFunction(prompt1);
  const keypoints = await ChatGPTFunction(prompt2);
  const jobResponsibilities = await ChatGPTFunction(prompt3);

  // Integrating the response into the database
  const chatgptData = { objective, keypoints, jobResponsibilities };
  const data = { ...newEntry, ...chatgptData };
  database.push(data);

  res.json({
    message: "Request successful!",
    data,
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
