<template>
    <header class="container">
        <!-- <div v-if="isLoading">
            <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div> -->
        <Landing v-if="isLoading == false && signedIn" :client="client" :Sdk="Sdk" :nodetype="nodetype">{MultiSig Landing}</Landing>
    </header>

    <main class="container flex-shrink-0 mb-4">
    </main>

    <!-- <footer  v-if="isLoading == false && signedIn" class="container bg-black footer position-absolute bottom-0 start-50 translate-middle-x text-center">
        <span class="text-light fancy-font position-absolute bottom-0 start-0 ms-2 mb-4">scan qr code -> </span>
        <button @click="openScan" class="btn btn-default mt-2 mb-4" role="button" id="open-sign">
            <img src="/apple-touch-icon.png" class="border border-1 rounded-3" alt="open sign" width="55" />
        </button>
    </footer> -->
</template>

<script>
    import Refs from './components/Refs.vue'
    import Landing from './components/Landing.vue'
    import { XrplClient } from 'xrpl-client'

    const xapp = window.xAppSdk

    import { XummSdkJwt } from 'xumm-sdk'

    export default {
        components: {
            Landing,
            Refs
        },
        data() {
            return {
                Sdk: new XummSdkJwt(import.meta.env.VITE_APP_KEY),
                nodetype: 'TESTNET',
                socket: null,
                timeout_socket: null,
                reconnect_socket: 0,
                pong: false,
                client: null,
                signedIn: false,
                isLoading: true
            }
        },
        async mounted() {
            
            await this.jwtFlow()
            this.xAppListeners()
        },
        methods: {
            async xAppListeners() {
                xapp.on('qr', async function (data) {                    
                    console.log('QR scanned / cancelled', data)
                    console.log('uuid', data.qrContents.split('/')[4])

                    xapp.openSignRequest({ 'uuid': data.qrContents.split('/')[4] })
                        .then(d => {
                            // d (returned value) can be Error or return data:
                            console.log('ELVIS SCANNED A QR CODE')
                            console.log('openSignRequest response:', d instanceof Error ? d.message : d)
                        })
                        .catch(e => console.log('Error:', e.message))
                })

                xapp.on('payload', function (data) {
                    console.log('Payload resolved', data)
                })
            },
            async openScan() {
                xapp.scanQr()
                    .then(d => {
                        // d (returned value) can be Error or return data:
                        console.log('scanQr response:', d instanceof Error ? d.message : d)
                    })
                    .catch(e => console.log('Error:', e.message))

                    
            },
            async getStoreage() {
                console.log('getting store value')

			    const storageGet = await this.Sdk.storage.get()
			    console.log('storageGet', storageGet)
            },
            async jwtFlow() {
                const tokenData = await this.Sdk.getOttData()
                console.log('tokenData', tokenData)
                this.$store.dispatch('xummTokenData', tokenData)
                console.log('account', tokenData.account)
                this.$store.dispatch('setAccount', tokenData.account)
                this.nodetype = tokenData.nodetype

                const servers = [tokenData.nodewss]
                if (tokenData.nodetype == 'MAINNET') {
                    servers.unshift('wss://node.panicbot.xyz')
                }
                console.log('ws servers', servers)
                
                this.client = new XrplClient(servers)

                const callback = async (event) => {
                    let request = {
                        'id': 'xrpl-local',
                        'command': 'ledger',
                        'ledger_hash': event.ledger_hash,
                        'ledger_index': 'validated',
                        'transactions': true,
                        'expand': true,
                        'owner_funds': true
                    }
    
                    const ledger_result = await this.client.send(request)
                    if ('error' in ledger_result) {
                        console.log('XRPL error', ledger_result)
                    }
                    
                    if ('ledger' in ledger_result) {
                        // console.log('ledger', ledger_result)
                        this.$store.dispatch('setLedger', ledger_result.ledger.ledger_index)
                    }
                }
                this.client.on('ledger', callback)
                await this.jwtSignIn()
            },
            async jwtSignIn() {
                const self = this
                const request  = { txjson: { TransactionType: 'SignIn' }}
                // const subscription = await this.Sdk.payload.create(request)

                const subscription = await this.Sdk.payload.createAndSubscribe(request, async event => {
                    console.log('New payload event:', event.data)

                    if (event.data.signed === true) {
                        const payload = await self.Sdk.payload.get(event.uuid)
                        // console.log('used alternate account to sign', payload.response.signer)
                        // self.$store.dispatch('setAccount', payload.response.signer)

                        console.log('Woohoo! The sign request was signed :)')
                        self.signedIn = true
                        self.$store.dispatch('setUserToken', event.data.payload_uuidv4)
                        // await self.connectWebsocket()
                        await self.getStoreage()
                        // self.isLoading = false
                        return event.data
                    }

                    if (event.data.signed === false) {
                        console.log('The sign request was rejected :(')
                        console.log('close xApp!')
                        xapp.close({ refreshEvents: true })
                            .then(d => {
                                // d (returned value) can be Error or return data:
                                console.log('close response:', d instanceof Error ? d.message : d)
                            })
                            .catch(e => console.log('Error:', e.message))
                        return false
                    }
                })
                if (subscription != false) {
                    this.isLoading = false
                }
                console.log('subscription', subscription)

                xapp.openSignRequest({ uuid: subscription.created.uuid })
                    .then(d => {
                        // d (returned value) can be Error or return data:
                        console.log('openSignRequest response:', d instanceof Error ? d.message : d)
                    })
                    .catch(e => console.log('Error:', e.message))
            }
        }
    }
</script>

<style scoped>
    .fancy-font {
        font-family: 'Permanent Marker', serif;
    }

    .bg-black {
        background-color: #000000;
    }
</style>