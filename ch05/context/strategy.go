package context

import (
	"context"
)

type ContextStrategy interface {
	Name() string
	ShouldRun(ctx context.Context, engine *ContextEngine) bool
	Run(ctx context.Context, engine *ContextEngine) error
}
