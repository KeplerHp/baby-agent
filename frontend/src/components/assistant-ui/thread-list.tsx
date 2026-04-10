import { MessageSquarePlus, Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  useAui,
  ThreadListItemPrimitive,
  ThreadListPrimitive,
  useAuiState,
} from '@assistant-ui/react'

import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Input } from '../ui/input'

export default function AssistantThreadList() {
  const mainThreadId = useAuiState((s) => s.threads.mainThreadId)

  return (
    <aside
      style={{
        width: 260,
        background: 'var(--sidebar-bg)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          padding: '16px 12px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>
          Assistant UI
        </span>
        <ThreadListPrimitive.New
          title="New Chat"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            padding: 4,
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <MessageSquarePlus size={18} />
        </ThreadListPrimitive.New>
      </div>

      <ThreadListPrimitive.Root
        style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}
      >
        <ThreadListPrimitive.Items>
          {({ threadListItem }) => {
            const active = threadListItem.id === mainThreadId
            return (
              <ThreadListItemPrimitive.Root
                key={threadListItem.id}
                style={{
                  marginBottom: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <ThreadListItemPrimitive.Trigger
                  style={{
                    flex: 1,
                    textAlign: 'left',
                    background: active ? 'rgba(124,58,237,0.15)' : 'transparent',
                    border: active
                      ? '1px solid rgba(124,58,237,0.4)'
                      : '1px solid transparent',
                    borderRadius: 8,
                    padding: '8px 10px',
                    cursor: 'pointer',
                    color: active ? 'var(--accent-light)' : 'var(--text)',
                    fontSize: 13,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <ThreadListItemPrimitive.Title />
                </ThreadListItemPrimitive.Trigger>
                {threadListItem.remoteId ? (
                  <RenameThreadButton currentTitle={threadListItem.title || 'Untitled'} />
                ) : null}
                {threadListItem.remoteId ? (
                  <ThreadListItemPrimitive.Delete
                    title="Delete Conversation"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      padding: '6px 8px',
                      borderRadius: 6,
                      fontSize: 14,
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </ThreadListItemPrimitive.Delete>
                ) : null}
              </ThreadListItemPrimitive.Root>
            )
          }}
        </ThreadListPrimitive.Items>
      </ThreadListPrimitive.Root>
    </aside>
  )
}

function RenameThreadButton({ currentTitle }: { currentTitle: string }) {
  const aui = useAui()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(currentTitle)

  useEffect(() => {
    if (!open) {
      setTitle(currentTitle)
    }
  }, [currentTitle, open])

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()

    const normalized = title.trim()
    if (!normalized || normalized === currentTitle) {
      setOpen(false)
      return
    }

    aui.threadListItem().rename(normalized)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="Rename Conversation"
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
          }}
        >
          <Pencil size={14} />
        </Button>
      </DialogTrigger>
      <DialogContent onClick={(event) => event.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Rename conversation</DialogTitle>
            <DialogDescription>
              Update the thread title shown in the sidebar.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <Input
              autoFocus
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onClick={(event) => event.stopPropagation()}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
