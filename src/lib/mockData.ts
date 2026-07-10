export interface Paper {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  citationCount: number;
  abstract: string;
  tags: string[];
  category: string;
  readingProgress: number; // 0 to 100
  isFavorite: boolean;
  content: {
    sectionTitle: string;
    text: string;
  }[];
  equations: {
    id: string;
    latex: string;
    description: string;
    derivation: string;
    variables: { name: string; meaning: string }[];
  }[];
  datasets: {
    name: string;
    source: string;
    size: string;
    features: string[];
    description: string;
  }[];
  references: {
    id: string;
    title: string;
    authors: string;
    year: number;
    citations: number;
    domain: string;
  }[];
  citedBy: {
    id: string;
    title: string;
    authors: string;
    year: number;
    citations: number;
    domain: string;
  }[];
  researchGaps: string[];
  futureScope: string[];
  contributions: string[];
}

export const mockPapers: Paper[] = [
  {
    id: "paper-1",
    title: "Attention Is All You Need",
    authors: ["Ashish Vaswani", "Noam Shazeer", "Niki Parmar", "Jakob Uszkoreit", "Llion Jones", "Aidan N. Gomez", "Lukasz Kaiser", "Illia Polosukhin"],
    journal: "Advances in Neural Information Processing Systems (NeurIPS)",
    year: 2017,
    citationCount: 110543,
    abstract: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks that include an encoder and a decoder. The best performing models also connect the encoder and decoder through an attention mechanism. We propose a new simple network architecture, the Transformer, based solely on attention mechanisms, dispensing with recurrence and convolutions entirely. Experiments on two machine translation tasks show these models to be superior in quality while being more parallelizable and requiring significantly less time to train.",
    tags: ["Transformer", "Attention", "NLP", "Deep Learning"],
    category: "Deep Learning",
    readingProgress: 85,
    isFavorite: true,
    content: [
      {
        sectionTitle: "1. Introduction",
        text: "Recurrent neural networks, long short-term memory (LSTM) and gated recurrent neural networks in particular, have been firmly established as state of the art approaches in sequence modeling and transduction problems such as language modeling and machine translation. However, recurrent models suffer from computational bottlenecks due to their sequential nature, which precludes parallelization within training examples. This paper introduces the Transformer, a model architecture eschewing recurrence and instead relying entirely on self-attention mechanisms to draw global dependencies between input and output."
      },
      {
        sectionTitle: "2. Background",
        text: "The goal of reducing sequential computation also forms the foundation of the Extended Neural GPU, ByteNet and ConvS2S, which all use convolutional neural networks as basic building blocks. In these models, the number of operations required to relate signals from two arbitrary input or output positions grows lineary or logarithmically with the distance between positions. In the Transformer, this is reduced to a constant number of operations, albeit at the cost of reduced effective resolution due to averaging attention-weighted positions, an effect we counteract with Multi-Head Attention."
      },
      {
        sectionTitle: "3. Model Architecture",
        text: "Most competitive neural sequence transduction models have an encoder-decoder structure. Here, the encoder maps an input sequence of symbol representations to a sequence of continuous representations. Given this, the decoder then generates an output sequence of symbols one element at a time. At each step the model is auto-regressive, consuming the previously generated symbols as additional input when generating the next."
      },
      {
        sectionTitle: "4. Scaled Dot-Product Attention",
        text: "We call our particular attention 'Scaled Dot-Product Attention'. The input consists of queries and keys of dimension d_k, and values of dimension d_v. We compute the dot products of the query with all keys, divide each by the square root of d_k, and apply a softmax function to obtain the weights on the values. In practice, we compute the attention function on a set of queries simultaneously, packed together into a matrix Q. The keys and values are also packed into matrices K and V."
      },
      {
        sectionTitle: "5. Multi-Head Attention",
        text: "Instead of performing a single attention function with d_model-dimensional keys, queries and values, we found it beneficial to linearly project the queries, keys and values h times with different, learned linear projections to d_k, d_k and d_v dimensions, respectively. On each of these projected versions of queries, keys and values we then perform the attention function in parallel, yielding d_v-dimensional output values. These are concatenated and once again projected, resulting in the final values."
      },
      {
        sectionTitle: "6. Conclusion",
        text: "In this work, we presented the Transformer, the first sequence transduction model based entirely on attention, replacing the recurrent layers most commonly used in encoder-decoder architectures with multi-headed self-attention. For translation tasks, the Transformer can be trained significantly faster than architectures based on recurrent or convolutional layers. On both WMT 2014 English-to-German and WMT 2014 English-to-French translation tasks, we achieved a new state of the art."
      }
    ],
    equations: [
      {
        id: "eq-1",
        latex: "\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V",
        description: "Scaled Dot-Product Attention computes the attention weights by scaling the dot product of queries (Q) and keys (K) by the square root of the key dimension (d_k), applying softmax to get weights, and multiplying by the values (V).",
        derivation: "The dot-product attention is scaled down because for large values of d_k, the dot products grow large in magnitude, pushing the softmax function into regions with extremely small gradients. Dividing by sqrt(d_k) counteracts this effect.",
        variables: [
          { name: "Q", meaning: "Query matrix of size (N, d_k) containing sequence queries" },
          { name: "K", meaning: "Key matrix of size (M, d_k) containing sequence keys" },
          { name: "V", meaning: "Value matrix of size (M, d_v) containing sequence values" },
          { name: "d_k", meaning: "Dimensionality of keys and queries, used as the scaling factor" }
        ]
      },
      {
        id: "eq-2",
        latex: "\\text{MultiHead}(Q, K, V) = \\text{Concat}(\\text{head}_1, ..., \\text{head}_h)W^O",
        description: "Multi-Head Attention projects the queries, keys, and values h times, performs attention on each projection, concatenates the outputs, and projects the concatenation.",
        derivation: "This allows the model to jointly attend to information from different representation subspaces at different positions. With a single attention head, averaging inhibits this.",
        variables: [
          { name: "head_i", meaning: "Attention(Q * W_i^Q, K * W_i^K, V * W_i^V) representing individual attention head" },
          { name: "W^O", meaning: "Learned projection matrix to map concatenated heads back to the model dimension" }
        ]
      }
    ],
    datasets: [
      {
        name: "WMT 2014 English-to-German",
        source: "Workshop on Machine Translation",
        size: "4.5 Million sentence pairs",
        features: ["BPE (Byte Pair Encoding) vocabulary of 37,000 tokens", "Parallel sentence alignments"],
        description: "Standard translation dataset used to benchmark translation systems in academic literature."
      },
      {
        name: "WMT 2014 English-to-French",
        source: "Workshop on Machine Translation",
        size: "36 Million sentence pairs",
        features: ["BPE vocabulary of 32,000 tokens", "High-resource translation pairs"],
        description: "A larger high-resource dataset used to evaluate neural machine translation scaling capabilities."
      }
    ],
    references: [
      { id: "ref-1", title: "Neural Machine Translation by Jointly Learning to Align and Translate", authors: "Bahdanau et al.", year: 2014, citations: 29402, domain: "Attention Mechanisms" },
      { id: "ref-2", title: "Long Short-Term Memory", authors: "Hochreiter & Schmidhuber", year: 1997, citations: 89400, domain: "Recurrent Networks" },
      { id: "ref-3", title: "Effective Approaches to Attention-based Neural Machine Translation", authors: "Luong et al.", year: 2015, citations: 12432, domain: "NLP Translation" }
    ],
    citedBy: [
      { id: "paper-2", title: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding", authors: "Devlin et al.", year: 2018, citations: 92451, domain: "NLP Pre-training" },
      { id: "paper-3", title: "Language Models are Few-Shot Learners (GPT-3)", authors: "Brown et al.", year: 2020, citations: 24503, domain: "Large Language Models" },
      { id: "paper-4", title: "ViT: An Image is Worth 16x16 Words", authors: "Dosovitskiy et al.", year: 2020, citations: 18492, domain: "Computer Vision" }
    ],
    researchGaps: [
      {
        id: "gap-1",
        description: "Quadratic memory complexity O(N^2) relative to sequence length due to the full attention matrix calculation, limiting long document processing."
      },
      {
        id: "gap-2",
        description: "Lack of inherent inductive bias for translation invariance or sequential ordering, necessitating artificial positional encodings."
      }
    ].map(g => g.description),
    futureScope: [
      "Optimizing attention computation to achieve linear O(N) complexity for extreme context windows.",
      "Applying Transformer architectures to non-textual modalities such as audio, video, and tabular data.",
      "Exploring alternative positional representation schemes (e.g., rotary embeddings, relative positions)."
    ],
    contributions: [
      "Introduction of the self-attention based Transformer architecture dispensing with recurrent cells.",
      "Demonstration of significant computational parallelizability over LSTMs, leading to massive speedups in training.",
      "Achieving state-of-the-art performance on English-to-German and English-to-French WMT benchmarks."
    ]
  },
  {
    id: "paper-2",
    title: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
    authors: ["Jacob Devlin", "Ming-Wei Chang", "Kenton Lee", "Kristina Toutanova"],
    journal: "Proceedings of NAACL-HLT",
    year: 2018,
    citationCount: 92451,
    abstract: "We introduce a new language representation model called BERT, which stands for Bidirectional Encoder Representations from Transformers. Unlike recent language representation models, BERT is designed to pre-train deep bidirectional representations from unlabeled text by jointly conditioning on both left and right context in all layers. As a result, the pre-trained BERT model can be fine-tuned with just one additional output layer to create state-of-the-art models for a wide range of tasks, such as question answering and language inference, without substantial task-specific architecture modifications.",
    tags: ["BERT", "Transformer", "Pre-training", "Bidirectional", "NLP"],
    category: "NLP",
    readingProgress: 40,
    isFavorite: false,
    content: [
      {
        sectionTitle: "1. Introduction",
        text: "Language model pre-training has been shown to be effective for improving many natural language processing tasks. These include sentence-level tasks such as natural language inference and paraphrasing, as well as token-level tasks such as named entity recognition and question answering. There are two existing strategies for applying pre-trained representations to downstream tasks: feature-based (like ELMo) and fine-tuning (like GPT-1). Both approaches share the same limitation: they are unidirectional, which restricts the power of pre-trained representations, especially for token-level tasks. BERT resolves this by using a Masked Language Model (MLM) pre-training objective."
      },
      {
        sectionTitle: "2. Masked Language Model",
        text: "Intuitively, it is reasonable to believe that a deep bidirectional model is strictly more powerful than either a left-to-right model or the shallow concatenation of a left-to-right and a right-to-left model. Unfortunately, standard conditional language models can only be trained left-to-right or right-to-left, as bidirectional conditioning would allow each word to indirectly 'see itself' in a multi-layered context. To train a deep bidirectional representation, we mask 15% of the input tokens at random, and then predict those masked tokens. We refer to this procedure as a Masked Language Model (MLM)."
      }
    ],
    equations: [
      {
        id: "eq-3",
        latex: "L_{\\text{MLM}} = -\\sum_{i \\in M} \\log P(x_i | \\tilde{x})",
        description: "The MLM loss calculates the negative log-likelihood of predicting the original token x_i for all masked positions M, given the corrupted sequence context.",
        derivation: "By optimizing this loss, the model learns to encode rich bidirectional contextual relationships from surrounding words during training.",
        variables: [
          { name: "M", meaning: "Set of indices representing the masked positions in the sentence" },
          { name: "x_i", meaning: "The original ground truth token at index i" },
          { name: "P(x_i | \\tilde{x})", meaning: "Predicted probability of token x_i given the masked sequence" }
        ]
      }
    ],
    datasets: [
      {
        name: "BooksCorpus",
        source: "Zhu et al. (2015)",
        size: "800 Million Words",
        features: ["Clean book narrative texts", "Good for extracting long contiguous sentences"],
        description: "A large corpus of unpublished books useful for learning long-range linguistic structures."
      },
      {
        name: "English Wikipedia",
        source: "Wikimedia Foundation",
        size: "2,500 Million Words",
        features: ["Structured informational text", "Excludes tables, lists, and headers"],
        description: "Standard encyclopedic data useful for learning factual representations."
      }
    ],
    references: [
      { id: "paper-1", title: "Attention Is All You Need", authors: "Vaswani et al.", year: 2017, citations: 110543, domain: "Transformer Architecture" },
      { id: "ref-4", title: "Semi-supervised Sequence Learning", authors: "Dai & Le", year: 2015, citations: 4322, domain: "Pre-training NLP" },
      { id: "ref-5", title: "Deep Contextualized Word Representations", authors: "Peters et al. (ELMo)", year: 2018, citations: 15980, domain: "Contextual Word Vectors" }
    ],
    citedBy: [
      { id: "paper-3", title: "Language Models are Few-Shot Learners (GPT-3)", authors: "Brown et al.", year: 2020, citations: 24503, domain: "LLM scaling" },
      { id: "ref-6", title: "RoBERTa: A Robustly Optimized BERT Pretraining Approach", authors: "Liu et al.", year: 2019, citations: 19432, domain: "Optimized BERT" }
    ],
    researchGaps: [
      "Discrepancy between pre-training and fine-tuning: [MASK] token never appears during fine-tuning, causing a mismatch.",
      "Assumption that masked tokens are independent of each other given the unmasked tokens, neglecting joint probabilities."
    ],
    futureScope: [
      "Investigating pre-training objectives that do not require explicit artificial masking tokens (e.g., ELECTRA generator-discriminator).",
      "Scaling the bidirectional representation to multi-lingual models (mBERT) and cross-lingual alignment."
    ],
    contributions: [
      "Introduction of the Masked Language Model (MLM) enabling deep bidirectional pre-training.",
      "Showing that pre-trained representations eliminate the need for many heavily engineered task-specific architectures.",
      "Achieving state-of-the-art results on 11 NLP tasks, including GLUE benchmarks and SQuAD question answering."
    ]
  }
];
