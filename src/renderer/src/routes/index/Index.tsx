import { useCallback, useEffect, useState } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket'
import { GamepadListener } from 'gamepad.js';

export const Index = (): JSX.Element => {
  const socketURL = 'ws://localhost:2333/blocks/ws'
  const [messageHistory, setMessageHistory] = useState<any>([])
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketURL)

  useEffect(() => {
    if (lastMessage !== null) {
      setMessageHistory((prev) => prev.concat(lastMessage))
    }
  }, [lastMessage, setMessageHistory])

  const handleClickSendMessage = useCallback(() => sendMessage('1'), [])

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated'
  }[readyState]

  let lastMSG = 0;

  const onButtonChange = (button): void => {
    console.dir(button)
    if (!button.detail.pressed && (window.performance.now() - lastMSG) > 100) {
      lastMSG = window.performance.now();
      sendMessage(button.detail.button);
    }
  }

  const listener = new GamepadListener({
    button: {
      analog: true
    }
  });

  listener.on('gamepad:button', onButtonChange);

  listener.on('gamepad:axis', event => {
    const {
      // index,// Gamepad index: Number [0-3].
      axis, // Axis index: Number [0-N].
      value, // Current value: Number between -1 and 1. Float in analog mode, integer otherwise.
      // gamepad, // Native Gamepad object
    } = event.detail;
    if (axis === 2){
      sendMessage(`axis ${axis} ${value}`);
    }
  });

  listener.start();

  return (
    <div>
      <button onClick={handleClickSendMessage} disabled={readyState !== ReadyState.OPEN}>
        Click Me to send 1
      </button>
      <span>The WebSocket is currently {connectionStatus}</span>
      {lastMessage ? <span>Last message: {lastMessage.data}</span> : null}
    </div>
  )
}
