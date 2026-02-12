import { EventQueueService, EventQueueItem } from '../services/eventQueueService'

export type EventHandler = (event: EventQueueItem) => Promise<void>

const POLL_INTERVAL_MS = 15000 // 15 seconds

export class EventQueueProcessor {
  private static handlers: Map<string, EventHandler> = new Map()
  private static isRunning = false
  private static intervalId: ReturnType<typeof setInterval> | null = null

  static registerHandler(eventType: string, handler: EventHandler): void {
    this.handlers.set(eventType, handler)
    console.log(`[EventQueueProcessor] Registered handler for: ${eventType}`)
  }

  static async init(): Promise<void> {
    if (this.isRunning) {
      console.log('[EventQueueProcessor] Already running')
      return
    }

    this.isRunning = true
    console.log(`[EventQueueProcessor] Starting with ${this.handlers.size} handler(s), polling every ${POLL_INTERVAL_MS / 1000}s`)

    this.intervalId = setInterval(async () => {
      if (!this.isRunning) return
      await this.pollAndProcess()
    }, POLL_INTERVAL_MS)

    // Also process immediately on start
    await this.pollAndProcess()
  }

  private static async pollAndProcess(): Promise<void> {
    try {
      let processedCount = 0
      // Process all available events in a loop
      while (this.isRunning) {
        const processed = await this.processNext()
        if (!processed) break
        processedCount++
        // Safety: limit batch to 50 events per poll
        if (processedCount >= 50) break
      }
    } catch (error) {
      console.error('[EventQueueProcessor] Poll error:', error)
    }
  }

  private static async processNext(): Promise<boolean> {
    try {
      const event = await EventQueueService.dequeue()
      if (!event) return false

      console.log(`[EventQueueProcessor] Processing event: ${event.event_type} (${event.id})`)

      const handler = this.handlers.get(event.event_type)
      if (!handler) {
        await EventQueueService.fail(event.id, `No handler registered for event type: ${event.event_type}`)
        return true
      }

      try {
        await handler(event)
        await EventQueueService.complete(event.id)
        console.log(`[EventQueueProcessor] Event ${event.id} completed`)
      } catch (handlerError: any) {
        console.error(`[EventQueueProcessor] Handler error for ${event.event_type}:`, handlerError.message)
        await EventQueueService.fail(event.id, handlerError.message || 'Unknown handler error')
      }

      return true
    } catch (error) {
      console.error('[EventQueueProcessor] processNext error:', error)
      return false
    }
  }

  static stop(): void {
    this.isRunning = false
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    console.log('[EventQueueProcessor] Stopped')
  }

  static getStatus(): { running: boolean; registeredHandlers: string[] } {
    return {
      running: this.isRunning,
      registeredHandlers: Array.from(this.handlers.keys()),
    }
  }
}
