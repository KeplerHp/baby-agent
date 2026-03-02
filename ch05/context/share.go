package context

import (
	"log"

	"github.com/openai/openai-go/v3"
	"github.com/tiktoken-go/tokenizer"
)

var tokenEnc tokenizer.Codec

func init() {
	var err error
	tokenEnc, err = tokenizer.Get(tokenizer.Cl100kBase)
	if err != nil {
		log.Fatal(err)
	}
}

func CountTokens(message openai.ChatCompletionMessageParamUnion) int {
	contentAny := message.GetContent().AsAny()
	switch contentAny.(type) {
	case *string:
		count, _ := tokenEnc.Count(*contentAny.(*string))
		return count
	}
	return 0
}
