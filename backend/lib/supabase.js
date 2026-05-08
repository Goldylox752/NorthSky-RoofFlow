> flow-os-backend@1.0.0 start
> node server.js
/opt/render/project/src/backend/node_modules/@supabase/realtime-js/dist/main/lib/websocket-factory.js:103
        throw new Error(errorMessage);
        ^
Error: Node.js 20 detected without native WebSocket support.
Suggested solution: For Node.js < 22, install "ws" package and provide it via the transport option:
import ws from "ws"
new RealtimeClient(url, { transport: ws })
    at WebSocketFactory.getWebSocketConstructor (/opt/render/project/src/backend/node_modules/@supabase/realtime-js/dist/main/lib/websocket-factory.js:103:15)
    at RealtimeClient._initializeOptions (/opt/render/project/src/backend/node_modules/@supabase/realtime-js/dist/main/RealtimeClient.js:642:164)
    at new RealtimeClient (/opt/render/project/src/backend/node_modules/@supabase/realtime-js/dist/main/RealtimeClient.js:185:43)
    at SupabaseClient._initRealtimeClient (/opt/render/project/src/backend/node_modules/@supabase/supabase-js/dist/index.cjs:554:10)
    at new SupabaseClient (/opt/render/project/src/backend/node_modules/@supabase/supabase-js/dist/index.cjs:389:24)
    at createClient (/opt/render/project/src/backend/node_modules/@supabase/supabase-js/dist/index.cjs:587:9)
    at Object.<anonymous> (/opt/render/project/src/backend/lib/supabase.js:7:18)
    at Module._compile (node:internal/modules/cjs/loader:1521:14)
    at Module._extensions..js (node:internal/modules/cjs/loader:1623:10)
    at Module.load (node:internal/modules/cjs/loader:1266:32)
Node.js v20.20.2
==> Exited with status 1
==> Common ways to troubleshoot your deploy: https