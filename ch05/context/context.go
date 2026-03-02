package context

import (
	"context"
	"log"
	"os"
	"runtime"
	"strings"

	"github.com/openai/openai-go/v3"

	"babyagent/ch05/storage"
)

type ContextEngine struct {
	systemPromptTemplate string

	storage storage.Storage

	messages   []openai.ChatCompletionMessageParamUnion
	strategies []ContextStrategy

	contextTokens int
	contextWindow int
}

func NewContextEngine(storage storage.Storage, strategies []ContextStrategy) *ContextEngine {
	return &ContextEngine{
		storage:       storage,
		strategies:    strategies,
		messages:      make([]openai.ChatCompletionMessageParamUnion, 0),
		contextWindow: 200000,
	}
}

func (c *ContextEngine) GetContextUsage() float64 {
	if c.contextWindow == 0 {
		return 0
	}
	return float64(c.contextTokens) / float64(c.contextWindow)
}

// AddMessages 批量添加消息，只应用一次策略
func (c *ContextEngine) AddMessages(ctx context.Context, messages []openai.ChatCompletionMessageParamUnion) {
	c.messages = append(c.messages, messages...)
	for _, msg := range messages {
		c.contextTokens += CountTokens(msg)
	}
	c.ApplyStrategies(ctx)
}

func (c *ContextEngine) ApplyStrategies(ctx context.Context) {
	for _, strategy := range c.strategies {
		if !strategy.ShouldRun(ctx, c) {
			continue
		}
		if err := strategy.Run(ctx, c); err != nil {
			log.Printf("strategy %s run failed, err: %v", strategy.Name(), err)
		}
	}
}

func (c *ContextEngine) SetSystemPrompt(promptTemplate string) {
	c.systemPromptTemplate = promptTemplate
}

func (c *ContextEngine) GetSystemPrompt() string {
	replaceMap := make(map[string]string)
	replaceMap["{runtime}"] = runtime.GOOS
	cwd, _ := os.Getwd()
	replaceMap["{workspace_path}"] = cwd

	// todo 集成 memory

	prompt := c.systemPromptTemplate
	for k, v := range replaceMap {
		prompt = strings.ReplaceAll(prompt, k, v)
	}
	return prompt
}

func (c *ContextEngine) SetContextWindow(window int) {
	c.contextWindow = window
}

// GetMessages 获取消息列表的副本（不含 system prompt）
func (c *ContextEngine) GetMessages() []openai.ChatCompletionMessageParamUnion {
	result := make([]openai.ChatCompletionMessageParamUnion, len(c.messages))
	copy(result, c.messages)
	return result
}

// GetAllMessages 获取包含 system prompt 的完整消息列表副本
func (c *ContextEngine) GetAllMessages() []openai.ChatCompletionMessageParamUnion {
	if c.systemPromptTemplate == "" {
		return c.GetMessages()
	}
	result := make([]openai.ChatCompletionMessageParamUnion, 0, len(c.messages)+1)
	result = append(result, openai.SystemMessage(c.GetSystemPrompt()))
	result = append(result, c.messages...)
	return result
}

// Reset 清空所有消息（保留 system prompt）
func (c *ContextEngine) Reset() {
	c.messages = make([]openai.ChatCompletionMessageParamUnion, 0)
	c.contextTokens = 0
}
