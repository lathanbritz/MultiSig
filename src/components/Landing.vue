<template>
    <div class="p-5 mb-4 bg-light rounded-3">
        <div class="container-fluid py-5">
            <img class="bog-roll" src="/e.png">
            <p class="col-md-8 fs-4">
                <p class="text-muted text-end fs-6">by three</p>
            </p>
            <p class="col-md-12 fs-4">
                <p class="text-center">
                    <p>ToDO</p>
                </p>
            </p>
        </div>
    </div>

    <footer>
        <p class="h1 text-center">{{ledger}}</p>
        <p class="p-3 mb-2 bg-dark text-white">{{account}}</p>
    </footer>
</template>

<script>
    const xapp = window.xAppSdk
    import { Buffer } from 'buffer'

    export default {
        name: 'Landing',
        props: ['client', 'Sdk', 'nodetype'],
        data() {
            return {
                hasMultisig: false,
                isLoading: true,
                selectedRows: [],
                ascending: false
            }
        },
        async mounted() {
            console.log('landing mounted...')
            this.hasMultisig = await this.checkSignerList()
            console.log('hasMultisig', this.hasMultisig)
            this.isLoading = false
        },
        computed: {
            ledger() {
                return this.$store.getters.getLedger
            },
            account() {
                return this.$store.getters.getAccount
            },
        },
        watch: {
            async account() {
                if (this.$store.getters.getAccount != '') {
                    console.log('account changed', this.account)
                }
            }
        },
        methods: {
            async checkSignerList(market = undefined) {
                const payload = {
                    'id': 8,
                    'command': 'account_objects',
                    'account': this.$store.getters.getAccount,
                    'ledger_index': 'validated',
                    'limit': 400
                }
                if (marker != undefined) {
                    payload.marker = marker
                }
                let res = await this.client.send(payload)
                for (let index = 0; index < account_objects.length; index++) {
                    const element = account_objects[index]
                    if (element.LedgerEntryType === 'SignerList') {
                        return true
                    }
                }
                if (res['marker'] !== undefined) {
                    return await this.checkSignerList(res['marker'])
                }
                return false
                
            },
            currencyHexToUTF8(code) {
				if (code.length === 3)
					return code

				let decoded = new TextDecoder()
					.decode(this.hexToBytes(code))
				let padNull = decoded.length

				while (decoded.charAt(padNull - 1) === '\0')
					padNull--

				return decoded.slice(0, padNull)
			},
            hexToBytes(hex) {
				let bytes = new Uint8Array(hex.length / 2)

				for (let i = 0; i !== bytes.length; i++) {
					bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
				}

				return bytes
			}
        },
    }
</script>
<style scoped>
    .bog-roll {
        width: 100%;
    }
    .main-text {
        color: #753ee2;
        -webkit-text-stroke-width: 1px;
        -webkit-text-stroke-color: black;
    }
    .btn-purple {
        background-color: #753ee2;
        color: #ffffff;
    }

    .btn-yellow {
        background-color: #ffc107;
        color: #ffffff;
    }
    .btn-pink {
        background-color: #ff1a8b;
        color: #ffffff;
    }

    .btn-green {
        background-color: #00e56a;
        color: #ffffff;
    }
</style>
