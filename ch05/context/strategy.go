package context

import (
	"context"
)

// StrategyResult 策略执行结果
type StrategyResult struct {
	Messages      []messageWrap // 新的消息列表
	ContextTokens int           // 新的 context token 计数
}

type ContextStrategy interface {
	Name() string
	ShouldApply(ctx context.Context, engine *ContextEngine) bool
	// Apply 纯函数，可以读取 engine 状态，返回新的状态（不修改 engine 内部变量）
	Apply(ctx context.Context, engine *ContextEngine) (StrategyResult, error)
}
