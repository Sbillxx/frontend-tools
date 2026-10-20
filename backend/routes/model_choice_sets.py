from llm import Llm

# Video variants always use Gemini.
VIDEO_VARIANT_MODELS = (
    Llm.GEMINI_3_5_FLASH_LITE_MINIMAL,
    Llm.GEMINI_3_5_FLASH_LITE_HIGH,
)

# All API keys available.

# Image (Create)

ALL_KEYS_MODELS_DEFAULT = (
    Llm.CLAUDE_OPUS_5_5_MEDIUM,
    Llm.GEMINI_3_5_FLASH_LITE_HIGH,
    Llm.CLAUDE_OPUS_5_5_XHIGH,
    Llm.GPT_6_1_SOL_HIGH,
)

# Text (Create)

# Refreshed 2026-07-27 from the "Text evals v1" session (8 briefs x 7
# models): sol high and opus 5 high replace gpt-5.5 high and opus 4.8 high
# at similar cost/latency; 3-flash minimal keeps the fast slot (48s median,
# $0.05/brief) and 3.1-pro low stays for now.
ALL_KEYS_MODELS_TEXT_CREATE = (
    Llm.GEMINI_3_5_FLASH_LITE_MINIMAL,
    Llm.GPT_5_6_SOL_HIGH,
    Llm.CLAUDE_OPUS_5_HIGH,
    Llm.GEMINI_3_5_FLASH_LITE_LOW,
)

# Image + Text (Update)

ALL_KEYS_MODELS_UPDATE = (
    Llm.GEMINI_3_5_FLASH_LITE_MINIMAL,
    Llm.GPT_6_1_SOL_LOW,
)

# Key subset fallbacks.
GEMINI_ANTHROPIC_MODELS = (
    Llm.GEMINI_3_5_FLASH_LITE_MINIMAL,
    Llm.GEMINI_3_5_FLASH_LITE_LOW,
    Llm.CLAUDE_OPUS_4_8_MEDIUM,
    Llm.GEMINI_3_5_FLASH_LITE_HIGH,
    Llm.GEMINI_3_5_FLASH_LITE_HIGH,
)
GEMINI_OPENAI_MODELS = (
    Llm.GEMINI_3_5_FLASH_LITE_MINIMAL,
    Llm.GEMINI_3_5_FLASH_LITE_LOW,
    Llm.GPT_5_5_HIGH,
    Llm.GPT_5_5_LOW,
)
OPENAI_ANTHROPIC_MODELS = (
    Llm.CLAUDE_OPUS_4_8_MEDIUM,
    Llm.GPT_5_5_HIGH,
    Llm.GPT_5_5_LOW,
)
GEMINI_ONLY_MODELS = (
    Llm.GEMINI_3_5_FLASH_LITE_MINIMAL,
    Llm.GEMINI_3_5_FLASH_LITE_LOW,
    Llm.GEMINI_3_5_FLASH_LITE_MEDIUM,
    Llm.GEMINI_3_5_FLASH_LITE_HIGH,
)
ANTHROPIC_ONLY_MODELS = (
    Llm.CLAUDE_OPUS_4_8_MEDIUM,
    Llm.CLAUDE_SONNET_4_6,
)
OPENAI_ONLY_MODELS = (
    Llm.GPT_5_5_HIGH,
    Llm.GPT_5_5_LOW,
)
