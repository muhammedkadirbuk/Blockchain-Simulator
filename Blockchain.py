import hashlib
import json
from block import Block
from Crypto.PublicKey import RSA
from Crypto.Signature import pkcs1_15
from Crypto.Hash import SHA256

class Blockchain:
    def __init__(self):
        self.pending_transactions = []
        self.chain = []
        self.state = {}
        self.contracts = []
        self._create_genesis_block()

    def _create_genesis_block(self):
        genesis = Block(0, [], "0")
        genesis.state_snapshot = {}
        self.chain.append(genesis)

    def _normalize_key(self, key):
        if not key or key == "SYSTEM":
            return key
        key = key.strip()
        header = "-----BEGIN PUBLIC KEY-----"
        footer = "-----END PUBLIC KEY-----"
        if header not in key:
            return key
        key = key[key.index(header):]
        if footer in key:
            key = key[:key.index(footer) + len(footer)]
        lines = [line.strip() for line in key.splitlines()]
        lines = [l for l in lines if l]
        body = ""
        for line in lines:
            if not line.startswith("-----"):
                body += line.replace(" ", "")
        result = [header]
        for i in range(0, len(body), 64):
            result.append(body[i:i+64])
        result.append(footer)
        return "\n".join(result)

    def register_wallet(self, public_key):
        public_key = self._normalize_key(public_key)
        if public_key not in self.state:
            self.state[public_key] = 500

    def add_transaction(self, sender_public_key, receiver_address, amount, signature):
        sender_public_key = self._normalize_key(sender_public_key)
        receiver_address = self._normalize_key(receiver_address)
        effective_balance = self._get_effective_balance(sender_public_key)
        if effective_balance < amount:
            return False
        self.pending_transactions.append({
            "sender": sender_public_key,
            "receiver": receiver_address,
            "amount": amount
        })
        return True

    def _get_effective_balance(self, address):
        address = self._normalize_key(address)
        balance = self.state.get(address, 0)
    
        for tx in self.pending_transactions:
            if tx["sender"] == address:
                balance -= tx["amount"]
            if tx["receiver"] == address:
                balance += tx["amount"]
        
        # Aktif kontratlardaki kilitli fonlar
        for contract in self.contracts:
            if self._normalize_key(contract["creator"]) == address:
                balance -= contract["payout_amount"]
        
        return balance

    def _apply_transaction(self, tx):
        sender = self._normalize_key(tx.get("sender") or tx.get("sender_public_key"))
        receiver = self._normalize_key(tx.get("receiver") or tx.get("receiver_address"))
        amount = tx["amount"]
        if sender and sender != "SYSTEM":
            self.state[sender] = self.state.get(sender, 0) - amount
        self.state[receiver] = self.state.get(receiver, 0) + amount

    def _check_and_trigger_contracts(self, address, received_amount):
        triggered_txs = []
        for contract in self.contracts:
            cond = self._normalize_key(contract["condition_receiver"])
            if cond == address and received_amount >= contract["threshold"]:
                creator = self._normalize_key(contract["creator"])
                payout_tx = {
                    "sender": creator,  # Creator Kontrat Ödemesi
                    "receiver": self._normalize_key(contract["payout_receiver"]),
                    "amount": contract["payout_amount"],
                    "note": "Smart Contract Executed"
                }
                triggered_txs.append(payout_tx)
        return triggered_txs

    def mine_pending_transactions(self):
        if not self.pending_transactions:
            return False

        contract_txs = []
        for tx in self.pending_transactions:
            receiver = self._normalize_key(tx.get("receiver") or tx.get("receiver_address"))
            received_amount = tx["amount"]
            self._apply_transaction(tx)
            triggered = self._check_and_trigger_contracts(receiver, received_amount)
            contract_txs.extend(triggered)

        all_txs = self.pending_transactions + contract_txs
        for ctx in contract_txs:
            self._apply_transaction(ctx)

        last_block = self.chain[-1]
        new_block = Block(
            index=len(self.chain),
            transactions=all_txs,
            previous_hash=last_block.hash
        )
        new_block.state_snapshot = dict(self.state)
        new_block.hash = self._proof_of_work(new_block)

        self.chain.append(new_block)
        self.pending_transactions = []
        return True

    def _proof_of_work(self, block, difficulty=3):
        block.nonce = 0
        target = "0" * difficulty
        while not block.hash.startswith(target):
            block.nonce += 1
            block.hash = block.calculate_hash()
        return block.hash

    def add_contract(self, creator, condition_receiver, threshold, payout_receiver, payout_amount):

        creator = self._normalize_key(creator)
        effective_balance = self._get_effective_balance(creator)
        
        if effective_balance < payout_amount:
            return False  # Yetersiz bakiye
        
        self.contracts.append({
            "creator": creator,
            "condition_receiver": self._normalize_key(condition_receiver),
            "threshold": threshold,
            "payout_receiver": self._normalize_key(payout_receiver),
            "payout_amount": payout_amount
        })
        return True

    def remove_contract(self, index):
        if 0 <= index < len(self.contracts):
            self.contracts.pop(index)

    def is_chain_valid(self):
        for i in range(1, len(self.chain)):
            curr = self.chain[i]
            prev = self.chain[i - 1]
            if curr.hash != curr.calculate_hash():
                return False
            if curr.previous_hash != prev.hash:
                return False
        return True