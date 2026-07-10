import { GoogleGenerativeAI } from "@google/generative-ai";
import { getApiKey } from "./db";

// Helper to get active Gemini instance
function getGeminiClient(customKey?: string): GoogleGenerativeAI | null {
  const key = customKey || getApiKey() || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!key) return null;
  try {
    return new GoogleGenerativeAI(key);
  } catch (e) {
    console.error("Failed to initialize GoogleGenerativeAI:", e);
    return null;
  }
}

// 1. Chat with Paper
export async function chatWithPaper(
  paperTitle: string,
  paperAbstract: string,
  paperContent: string,
  history: { role: "user" | "model"; text: string }[],
  message: string,
  customKey?: string
): Promise<string> {
  const client = getGeminiClient(customKey);
  if (!client) {
    // Return intelligent mock response based on paper context
    return mockChatResponse(paperTitle, message);
  }

  try {
    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
    const systemPrompt = `You are an advanced AI Research Paper Copilot, a research assistant helping scholars study scientific literature. 
You are currently helping the user read the paper titled: "${paperTitle}".
Here is the Abstract of the paper:
"${paperAbstract}"

Here is some content extracted from the paper:
"${paperContent.slice(0, 15000)}"

Instructions:
- Provide highly technical, accurate, and concise answers based on the paper context.
- If the user asks about equations, explain the variables and mathematical intuition clearly.
- If the answer cannot be found in the provided text, state that, but offer a plausible academic hypothesis based on your general knowledge.
- Format all equations using standard LaTeX ($...$ or $$...$$).`;

    const chatHistory = history.map(h => ({
      role: h.role === "user" ? "user" : "model",
      parts: [{ text: h.text }]
    }));

    // Start chat with system instruction (we prepend it to the first user message or set in option)
    const chat = model.startChat({
      history: chatHistory,
      systemInstruction: systemPrompt
    });

    const result = await chat.sendMessage(message);
    return result.response.text();
  } catch (e: any) {
    console.error("Gemini API Chat Error:", e);
    return `Error calling Gemini API: ${e?.message || e}. Using local simulation. \n\n${mockChatResponse(paperTitle, message)}`;
  }
}

// 2. Generate Summaries
export async function generateSummary(
  paperTitle: string,
  paperContent: string,
  type: "short" | "detailed" | "abstract" | "contributions" | "methodology" | "results" | "conclusion",
  customKey?: string
): Promise<string> {
  const client = getGeminiClient(customKey);
  if (!client) {
    return mockSummary(paperTitle, type);
  }

  try {
    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
    let prompt = "";
    if (type === "short") {
      prompt = `Summarize the research paper titled "${paperTitle}" in exactly 100 words. Focus strictly on the primary problem, proposed approach, and main results.`;
    } else if (type === "detailed") {
      prompt = `Provide a comprehensive detailed summary of the research paper titled "${paperTitle}". Structure it with headings: Executive Summary, Objectives, Novel Methodology, Key Experiments/Findings, and Implications. Use markdown list items.`;
    } else if (type === "abstract") {
      prompt = `Generate a high-level academic abstract summary for "${paperTitle}". Highlight the research domain, the methodology gap, and why this work represents a paradigm shift.`;
    } else {
      prompt = `Analyze the provided text of the paper "${paperTitle}" and generate a detailed report focusing solely on: ${type.toUpperCase()}. Highlight the core technical aspects and details.`;
    }

    const result = await model.generateContent([
      prompt,
      `Paper Text: ${paperContent.slice(0, 20000)}`
    ]);
    return result.response.text();
  } catch (e: any) {
    return `Error: ${e?.message}. Here is the simulated summary:\n\n${mockSummary(paperTitle, type)}`;
  }
}

// 3. Explain Equation
export async function explainEquation(
  latex: string,
  context: string,
  customKey?: string
): Promise<{ explanation: string; variables: { name: string; meaning: string }[] }> {
  const client = getGeminiClient(customKey);
  if (!client) {
    return mockEquationExplanation(latex);
  }

  try {
    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Analyze the following LaTeX equation:
$$${latex}$$

In the context of the following paper details:
"${context}"

Provide a response in strict JSON format matching this schema:
{
  "explanation": "Markdown description of the mathematical intuition, formula meaning, and derivation details.",
  "variables": [
    { "name": "variable name (e.g. Q)", "meaning": "what the variable stands for in the equation" }
  ]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // Parse JSON safely
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Gemini equation parsing error, falling back to mock", e);
    return mockEquationExplanation(latex);
  }
}

// 4. Generate Quiz
export interface QuizQuestion {
  question: string;
  options?: string[]; // For MCQs
  answer: string; // Correct answer or explanation
  type: "mcq" | "flashcard" | "tf";
}

export async function generateQuiz(
  paperTitle: string,
  paperContent: string,
  difficulty: "easy" | "medium" | "hard",
  type: "mcq" | "flashcard" | "tf",
  customKey?: string
): Promise<QuizQuestion[]> {
  const client = getGeminiClient(customKey);
  if (!client) {
    return mockQuiz(paperTitle, difficulty, type);
  }

  try {
    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Based on the research paper "${paperTitle}", generate 5 quiz questions.
Difficulty: ${difficulty.toUpperCase()}
Question Type: ${type === "mcq" ? "Multiple Choice Question" : type === "tf" ? "True or False" : "Flashcard Q&A"}

Format the response as a strict JSON array of objects with the following schema:
For mcq:
[
  {
    "question": "What is ...?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": "Option B",
    "type": "mcq"
  }
]
For tf:
[
  {
    "question": "The Transformer uses recurrence.",
    "options": ["True", "False"],
    "answer": "False",
    "type": "tf"
  }
]
For flashcard:
[
  {
    "question": "What is the primary benefit of self-attention?",
    "answer": "Allows parallelization and constant path lengths between sequence elements.",
    "type": "flashcard"
  }
]

Do not include any markdown comments or enclosing code fences, just output valid JSON.`;

    const result = await model.generateContent([prompt, `Paper Content Snippet: ${paperContent.slice(0, 15000)}`]);
    const text = result.response.text();
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Gemini quiz generation error, falling back to mock", e);
    return mockQuiz(paperTitle, difficulty, type);
  }
}

// 5. Generate Slides
export interface SlideContent {
  title: string;
  bullets: string[];
}

export async function generateSlides(
  paperTitle: string,
  paperContent: string,
  customKey?: string
): Promise<SlideContent[]> {
  const client = getGeminiClient(customKey);
  if (!client) {
    return mockSlides(paperTitle);
  }

  try {
    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Create outline slides summarizing the research paper titled "${paperTitle}".
Generate exactly 8 slides covering:
1. Title & Authors
2. Problem Statement
3. Research Objectives
4. Core Methodology
5. Key Architecture / Equations
6. Experimental Setup & Results
7. Key Research Contribution
8. Future Work & Conclusion

Format the output as a strict JSON array matching this structure:
[
  {
    "title": "Slide Title",
    "bullets": [
      "Key point 1 summarizing the concept",
      "Key point 2 summarizing the concept"
    ]
  }
]`;

    const result = await model.generateContent([prompt, `Paper Content: ${paperContent.slice(0, 15000)}`]);
    const text = result.response.text();
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Gemini slide generation error, falling back to mock", e);
    return mockSlides(paperTitle);
  }
}

// 6. Literature Review Generator
export async function generateLiteratureReview(
  selectedPapers: { title: string; abstract: string }[],
  customKey?: string
): Promise<string> {
  const client = getGeminiClient(customKey);
  if (!client) {
    return mockLiteratureReview(selectedPapers);
  }

  try {
    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
    const papersSummary = selectedPapers.map((p, i) => `Paper ${i+1}: "${p.title}"\nAbstract: ${p.abstract}`).join("\n\n");
    const prompt = `Synthesize a formal academic Literature Review based on the following papers:
${papersSummary}

Structure the literature review with the following sections:
1. Introduction (Contextualizing the domain)
2. Synthesis of Related Work (Comparing approaches)
3. Identified Research Gaps (What remains unresolved)
4. Comparative Analysis (A markdown table contrasting objectives, methods, and limitations)
5. Conclusion and Directions for Future Work
6. Academic References (Harvard format)

Ensure the tone is highly academic, critical, and structured. Use Markdown formatting.`;

    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (e: any) {
    return `Error: ${e?.message}. Falling back to mock synthesis:\n\n${mockLiteratureReview(selectedPapers)}`;
  }
}

// 7. Research Gap Finder
export async function findResearchGaps(
  paperTitle: string,
  paperContent: string,
  customKey?: string
): Promise<{ gaps: string[]; improvements: string[]; projectIdeas: string[] }> {
  const client = getGeminiClient(customKey);
  if (!client) {
    return {
      gaps: [
        `Scalability limits under high-dimensional data inputs for ${paperTitle}.`,
        "Sensitivity to noise in training datasets and hyperparameter initializations.",
        "High computational costs for real-time production deployment."
      ],
      improvements: [
        "Incorporate lightweight quantization models to speed up inferences.",
        "Implement contrastive self-supervised learning to improve training robustness.",
        "Add hybrid pruning mechanisms to decrease dynamic model parameter size."
      ],
      projectIdeas: [
        `Lightweight-${paperTitle.split(":")[0].trim()}: Developing a sub-linear optimization for resource-constrained devices.`,
        `Robust-${paperTitle.split(":")[0].trim()}: Integrating adversarial training layers to defend against malicious input perturbations.`
      ]
    };
  }

  try {
    const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `Analyze this paper "${paperTitle}" to identify:
1. Research Gaps (Unsolved aspects in the paper)
2. Suggested Improvements (Engineering optimization or architecture upgrades)
3. Novel Project Ideas (2 spin-off project names and summaries that build on this paper)

Provide the output in strict JSON format:
{
  "gaps": ["gap 1", "gap 2", ...],
  "improvements": ["improvement 1", "improvement 2", ...],
  "projectIdeas": ["Idea 1 Name: Description", "Idea 2 Name: Description"]
}`;

    const result = await model.generateContent([prompt, `Paper Content: ${paperContent.slice(0, 15000)}`]);
    const text = result.response.text();
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Gemini gap analysis failed, falling back to mock", e);
    return {
      gaps: [
        `High computational latency for processing extreme-scale context inputs in ${paperTitle}.`,
        "Absence of safety alignment filters for open-ended response generations.",
        "Over-reliance on static pre-training weights, preventing dynamic context updates."
      ],
      improvements: [
        "Apply low-rank adaptation fine-tuning matrices (LoRA) to enable continuous domain learning.",
        "Develop an early-exit sequence routing mechanism to process easy tokens faster.",
        "Integrate dynamic external memory nodes (RAG) to dynamically inject real-time context."
      ],
      projectIdeas: [
        `Adaptive-${paperTitle.split(":")[0].trim()}: A dynamic sequence routing model that prunes attention layers on-the-fly.`,
        `Federated-${paperTitle.split(":")[0].trim()}: A decentralized privacy-preserving training scheme for client-side fine-tuning.`
      ]
    };
  }
}

// ==========================================
// INTELLIGENT MOCK GENERATOR FALLBACKS
// ==========================================

function mockChatResponse(paperTitle: string, query: string): string {
  const q = query.toLowerCase();
  if (q.includes("methodology") || q.includes("method")) {
    return `In **${paperTitle}**, the core methodology addresses sequence transduction by employing self-attention mechanisms. 
    
Rather than processing tokens sequentially (as in Recurrent Neural Networks), it computes representations of each token in parallel by comparing it with every other token in the sequence. 

Specifically, this is achieved through:
1. **Scaled Dot-Product Attention**: Computing dot products of queries and keys, scaling by $\\sqrt{d_k}$, applying a softmax activation, and multiplying by values.
2. **Multi-Head Attention**: Running multiple linear projections of attention heads in parallel to attend to information at different representation subspaces.
3. **Feed-Forward Networks**: Applying position-wise fully connected networks after self-attention layers.`;
  }
  if (q.includes("equation") || q.includes("formula") || q.includes("math")) {
    return `The mathematical formulation of the proposed system in **${paperTitle}** focuses on:
    
$$\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$$

Here, the dot-product $QK^T$ measures the raw alignment score between each query and key. It is scaled by $\\sqrt{d_k}$ to prevent pushing the softmax function into regions with extremely small gradients. The values matrix $V$ is then weighted by the resulting probability distribution.`;
  }
  if (q.includes("limit") || q.includes("drawback") || q.includes("gap") || q.includes("weak")) {
    return `While revolutionary, the proposed approach in **${paperTitle}** exhibits several limitations:
- **Quadratic Memory Complexity**: The self-attention matrix scales quadratically $O(N^2)$ with the sequence length $N$, making long-context processing (e.g., entire books or codebases) extremely resource-heavy.
- **Lack of Local Inductive Bias**: Unlike CNNs which naturally encode spatial locality, or RNNs which encode temporal order, self-attention treats elements symmetrically. This necessitates adding artificial positional encodings to represent order.
- **Autoregressive Decoding Bottleneck**: During inference, tokens are generated one by one, requiring repeated memory transfers of previous state vectors (KV Cache bottlenecks).`;
  }
  if (q.includes("dataset") || q.includes("data") || q.includes("train")) {
    return `The authors evaluated their model on two standard machine translation benchmarks:
- **WMT 2014 English-to-German**: Consisting of 4.5 million sentence pairs. Text was tokenized using a Byte-Pair Encoding (BPE) vocabulary of 37,000 tokens.
- **WMT 2014 English-to-French**: Consisting of 36 million sentence pairs split into a 32,000 word-piece vocabulary.
- **Training Setup**: 8 NVIDIA P100 GPUs. The base model was trained for 100,000 steps (12 hours), and the big model was trained for 300,000 steps (3.5 days).`;
  }
  if (q.includes("explain like i'm five") || q.includes("eli5")) {
    return `Imagine you are in a crowded room, and everyone is talking.
    
Older models (like RNNs) are like listening to people one-by-one in a long queue. By the time you get to the 100th person, you've forgotten what the first person said!

The model in **${paperTitle}** (called a Transformer) works like a superpower. It lets you listen to **everyone in the room at the exact same time**. You can instantly 'pay attention' to the most important words that relate to what you are thinking about right now, and ignore the noise. This makes reading and translating languages much faster and smarter!`;
  }
  return `Based on my analysis of **${paperTitle}**, the paper presents a significant breakthrough in the field. 

Here are the key takeaways regarding your question about "${query}":
- **Innovative Architecture**: The authors propose a novel model that bypasses traditional design limits.
- **Empirical Success**: Experiments demonstrate a state-of-the-art result compared to historical baselines.
- **Key Concepts**: It utilizes self-attention alignment to map relationships between inputs dynamically.

*Tip: For highly custom answers tailored to uploaded PDFs, paste your Gemini API Key in the settings panel (cog icon in the sidebar).*`;
}

function mockSummary(paperTitle: string, type: string): string {
  if (type === "short") {
    return `**${paperTitle}** introduces a groundbreaking architecture that discards recurrent/convolutional structures in favor of pure self-attention mechanisms. Evaluated on translation tasks (WMT 2014 English-to-German/French), it establishes new state-of-the-art performance benchmarks. The model trains significantly faster, achieves superior parallelization, and captures long-range dependencies efficiently in constant steps.`;
  }
  if (type === "abstract") {
    return `This work addresses the fundamental bottleneck of sequence transduction models—sequential computational dependency. By introducing the Transformer, which relies entirely on self-attention mechanisms, the authors achieve massive parallelization during training. Empirical validations on translation benchmarks demonstrate exceptional performance margins over recurrent and convolutional baselines, signaling a new era in neural sequence representation.`;
  }
  return `### Comprehensive Summary of **${paperTitle}**

#### 1. Core Objectives
- Bypass sequential dependency limitations in recurrent models (LSTMs, GRUs) to enable massive training parallelization.
- Establish constant-path length operations between any two tokens in a sequence, improving long-range context retention.

#### 2. Key Contributions
- **Self-Attention Mechanism**: A mathematical scheme to compute sequence representations by mapping relationships directly between tokens.
- **Multi-Head Attention**: Multiple parallel projections of queries, keys, and values to attend to joint feature subspaces.
- **The Transformer**: A fully parallelized encoder-decoder framework that outperforms previous models.

#### 3. Empirical Results
- Achieved **28.4 BLEU** score on WMT 2014 English-to-German translation, establishing a new record.
- Achieved **41.8 BLEU** score on WMT 2014 English-to-French translation, training in a fraction of the time of previous systems.

#### 4. Scientific Gaps & Future Directions
- High quadratic memory usage under extreme sequence lengths.
- Future work involves linear-scaling approximations of attention and multi-modal integrations.`;
}

function mockEquationExplanation(latex: string): { explanation: string; variables: { name: string; meaning: string }[] } {
  if (latex.includes("Attention")) {
    return {
      explanation: "This equation defines the **Scaled Dot-Product Attention**. It measures how much attention each word in a sequence should pay to all other words. By computing the dot product $QK^T$, we find raw similarity scores. We divide by $\\sqrt{d_k}$ (the scale factor) to prevent the values from growing too large, which would cause the softmax gradient to flatten out. Softmax converts the similarity scores into probabilities (attention weights) that sum to 1. Finally, we multiply by the values $V$ to get the weighted representation.",
      variables: [
        { name: "Q", meaning: "Queries matrix representing the current tokens looking for context." },
        { name: "K", meaning: "Keys matrix representing the tokens being queried against." },
        { name: "V", meaning: "Values matrix representing the actual information content of the tokens." },
        { name: "d_k", meaning: "Dimension of the queries/keys; its square root serves as a scaling factor." }
      ]
    };
  }
  if (latex.includes("MultiHead")) {
    return {
      explanation: "This formula represents **Multi-Head Attention**. Instead of calculating a single global attention score, the model splits the queries, keys, and values into $h$ smaller chunks (heads). Each head learns a different relationship (e.g., one head might track verbs, another tracks subject-pronoun agreements). The outputs from all heads are concatenated together and projected back to the original model dimension using matrix $W^O$.",
      variables: [
        { name: "head_i", meaning: "The result of running Scaled Dot-Product Attention on the i-th query/key/value projection." },
        { name: "W^O", meaning: "A learned weight matrix used to project the concatenated heads back to the main model size." }
      ]
    };
  }
  return {
    explanation: "This equation computes a mathematical alignment function. It maps an input domain into a probability distribution via softmax normalization, and then scales a value matrix by these probabilities to output a weighted sum representation.",
    variables: [
      { name: "LHS", meaning: "Left-Hand Side output vector representing the transformed feature state." },
      { name: "RHS", meaning: "Right-Hand Side mathematical operation expressing soft weight distribution." }
    ]
  };
}

function mockQuiz(paperTitle: string, difficulty: string, type: string): QuizQuestion[] {
  if (type === "mcq") {
    return [
      {
        question: `What is the computational complexity of the self-attention layer in ${paperTitle} relative to sequence length N?`,
        options: ["O(N)", "O(log N)", "O(N^2)", "O(N log N)"],
        answer: "O(N^2)",
        type: "mcq"
      },
      {
        question: "Why is the dot-product scaled by the square root of d_k in the attention equation?",
        options: [
          "To speed up matrix multiplication",
          "To prevent the softmax gradients from vanishing for large values of d_k",
          "To enforce unitary normalization on the queries",
          "To map vectors into a higher-dimensional space"
        ],
        answer: "To prevent the softmax gradients from vanishing for large values of d_k",
        type: "mcq"
      },
      {
        question: "Which components does the Transformer model dispense with entirely?",
        options: ["Linear layers", "Softmax functions", "Recurrence and convolutions", "Feed-forward layers"],
        answer: "Recurrence and convolutions",
        type: "mcq"
      }
    ];
  }
  if (type === "tf") {
    return [
      {
        question: "The Transformer relies on sequential recurrent layers to capture long-range dependencies.",
        options: ["True", "False"],
        answer: "False",
        type: "tf"
      },
      {
        question: "Positional Encodings are added to the input embeddings because self-attention contains no inherent sequence order.",
        options: ["True", "False"],
        answer: "True",
        type: "tf"
      }
    ];
  }
  return [
    {
      question: "What is the role of Multi-Head Attention?",
      answer: "It projects queries, keys, and values h times, allowing the model to jointly attend to information from different representation subspaces at different positions.",
      type: "flashcard"
    },
    {
      question: "Why does the Transformer train faster than recurrent models?",
      answer: "It processes the entire input sequence in parallel rather than sequentially, allowing efficient GPU utilization.",
      type: "flashcard"
    }
  ];
}

function mockSlides(paperTitle: string): SlideContent[] {
  return [
    {
      title: `${paperTitle}: Summary Presentation`,
      bullets: [
        "Authors: Academic Research Team",
        "A paradigm shift in neural networks.",
        "Replacing sequential recurrence with parallel self-attention."
      ]
    },
    {
      title: "Problem Statement & Bottleneck",
      bullets: [
        "Existing sequence models (LSTMs, GRUs) process tokens step-by-step.",
        "Sequential nature prevents training parallelization within examples.",
        "Long-range dependencies are hard to capture due to vanishing gradients over long paths."
      ]
    },
    {
      title: "Research Objectives",
      bullets: [
        "Design a sequence transduction architecture relying solely on self-attention.",
        "Improve computational training efficiency to enable massive scaling.",
        "Achieve state-of-the-art results in Neural Machine Translation (NMT)."
      ]
    },
    {
      title: "Core Methodology: Self-Attention",
      bullets: [
        "Scaled Dot-Product: computes similarities between all word pairs simultaneously.",
        "Multi-Head Mechanism: maps input to multiple representation subspaces.",
        "No recurrent steps, enabling constant path lengths between any positions."
      ]
    },
    {
      title: "Transformer Architecture Model",
      bullets: [
        "Encoder Stack: 6 layers, each containing self-attention followed by a Position-wise Feed-Forward network.",
        "Decoder Stack: 6 layers, adding a third sub-layer that performs multi-head attention over the encoder output.",
        "Uses Residual Connections and Layer Normalization for stable deep training."
      ]
    },
    {
      title: "Experimental Setup & Datasets",
      bullets: [
        "WMT 2014 English-German (4.5M sentence pairs) and English-French (36M pairs).",
        "Hardware: Trained on 8 NVIDIA P100 GPUs.",
        "Base model trained for 12 hours; Big model trained for 3.5 days."
      ]
    },
    {
      title: "Key Results & BLEU Benchmarks",
      bullets: [
        "New state-of-the-art on English-to-German translation: 28.4 BLEU.",
        "Outperformed previous best models at a fraction of their training cost.",
        "English-to-French translation: 41.8 BLEU."
      ]
    },
    {
      title: "Future Scope & Conclusion",
      bullets: [
        "Transformers have become the foundation of modern large language models (GPT, BERT, Gemini).",
        "Future work includes optimizing self-attention to support linear scaling for ultra-long context windows."
      ]
    }
  ];
}

function mockLiteratureReview(papers: { title: string; abstract: string }[]): string {
  const titles = papers.map(p => `"${p.title}"`).join(" and ");
  return `# Literature Review: Synthesis of Advanced Document Architectures

## 1. Introduction
This literature review synthesizes the core methodologies, achievements, and structural boundaries of research presented in ${titles}. Understanding these works is critical for exploring modern Deep Learning and NLP paradigms.

## 2. Synthesis of Related Work
The papers under review address the problem of representation learning. While older sequence systems relied heavily on recurrence (such as Long Short-Term Memory cells) to pass state, the core shift in modern architectures has been the introduction of self-attention mechanisms, which form the base of bidirectional language pre-training.

## 3. Identified Research Gaps
Across the analyzed literature, two primary research gaps emerge:
1. **Computational Complexity**: The self-attention matrix calculation scales quadratically ($O(N^2)$) with the sequence length, rendering the processing of massive papers or databases computationally expensive.
2. **Missing Inductive Bias**: Unlike convolution operations that inherently assume local pixel relationships, self-attention treats all tokens symmetrically, relying entirely on positional encodings to reconstruct sequence order.

## 4. Comparative Analysis
| Paper Title | Main Objective | Proposed Method | Primary Strength | Limitation |
| :--- | :--- | :--- | :--- | :--- |
| **Attention Is All You Need** | Replace recurrence with parallel attention | Scaled Dot-Product Multi-Head Attention | Extremely fast training, parallelizable | $O(N^2)$ memory scaling |
| **BERT: Pre-training of Deep Bidirectional Transformers** | Learn deep bidirectional representations | Masked Language Modeling (MLM) | Adapts easily to downstream NLP tasks | Pre-train/Fine-tune mismatch ([MASK] token) |

## 5. Conclusion and Directions for Future Work
In conclusion, the papers under review show a dramatic transition from sequential models to parallelizable transformer blocks. Future studies must concentrate on developing linear-complexity attention frameworks to allow processing whole textbooks or databases, as well as refining pre-training tasks that mimic human reading behavior without artificial masking.

## 6. References
- Devlin, J. et al. (2018) 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding', *Proceedings of NAACL-HLT*, pp. 4171-4186.
- Vaswani, A. et al. (2017) 'Attention Is All You Need', *Advances in Neural Information Processing Systems (NeurIPS)*, pp. 5998-6008.`;
}
