from flask import Flask, jsonify, request
from flask_cors import CORS
from Blockchain import Blockchain
from Crypto.PublicKey import RSA

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

blockchain = Blockchain()

@app.route('/chain', methods=['GET'])
def get_chain():
    return jsonify({
        'chain': [b.__dict__ for b in blockchain.chain],
        'state': blockchain.state,
        'contracts': blockchain.contracts
    }), 200

@app.route('/wallet/new', methods=['GET'])
def wallet_new():
    key = RSA.generate(2048)
    pub = key.publickey().export_key().decode()
    blockchain.register_wallet(pub)
    return jsonify({"public_key": pub, "private_key": key.export_key().decode()})

@app.route('/transactions/new', methods=['POST'])
def new_tx():
    v = request.get_json()
    res = blockchain.add_transaction(
        v.get("sender_public_key"), 
        v.get("receiver_address"), 
        v.get("amount"), 
        v.get("signature")
    )
    return jsonify({"m": "Ok"}) if res else (jsonify({"m": "Bakiye Yetersiz"}), 400)

@app.route('/contracts/new', methods=['POST'])
def contract_new():
    v = request.get_json()
    result = blockchain.add_contract(
        v.get("creator"),
        v.get("condition_receiver"),
        v.get("threshold"),
        v.get("payout_receiver"),
        v.get("payout_amount")
    )
    if result:
        return jsonify({"m": "Kontrat oluşturuldu ve fon kilitlendi."}), 201
    else:
        return jsonify({"m": "Yetersiz bakiye - kontrat oluşturulamadı."}), 400

@app.route('/contracts/delete', methods=['POST'])
def contract_delete():
    idx = request.get_json().get("index")
    blockchain.remove_contract(idx)
    return jsonify({"m": "Kontrat iptal edildi, fon serbest bırakıldı."}), 200

@app.route('/mine', methods=['GET'])
def mine():
    if blockchain.mine_pending_transactions():
        return jsonify({"m": "Blok Başarıyla Kazıldı!"}), 200
    return jsonify({"m": "Bekleyen İşlem Yok."}), 400

@app.route('/validate', methods=['GET'])
def validate():
    return jsonify({"valid": blockchain.is_chain_valid()})

# ====== ATTACK SIMÜLASYONLARI ======

@app.route('/attack/tamper-block', methods=['POST'])
def attack_tamper_block():
    data = request.get_json()
    block_index = data.get("block_index", 1)
    
    if block_index >= len(blockchain.chain) or block_index < 1:
        return jsonify({"m": "Geçersiz Blok Dizini!!"}), 400
    
    target_block = blockchain.chain[block_index]
    
    if not target_block.transactions:
        return jsonify({"m": "Blokta Değiştirlecek İşlem Yok."}), 400
    
    original_amount = target_block.transactions[0].get('amount', 0)
    target_block.transactions[0]['amount'] = original_amount * 100
    
    return jsonify({
        "m": "Block tampered",
        "block": block_index,
        "original_amount": original_amount,
        "tampered_amount": target_block.transactions[0]['amount'],
        "chain_valid": blockchain.is_chain_valid()
    }), 200

@app.route('/attack/double-spend', methods=['POST'])
def attack_double_spend():
    data = request.get_json()
    sender = data.get("sender_public_key")
    receiver1 = data.get("receiver1")
    receiver2 = data.get("receiver2")
    amount = data.get("amount", 100)
    
    balance = blockchain._get_effective_balance(sender)
    
    # İlk transfer
    tx1_success = blockchain.add_transaction(sender, receiver1, amount, "mock")
    
    # İkinci transfer
    tx2_success = blockchain.add_transaction(sender, receiver2, amount, "mock")
    
    return jsonify({
        "m": "Double-spend attack attempted",
        "sender_balance": balance,
        "tx1_success": tx1_success,
        "tx2_success": tx2_success,
        "attack_prevented": tx1_success and not tx2_success
    }), 200

@app.route('/attack/invalid-signature', methods=['POST'])
def attack_invalid_signature():
    data = request.get_json()
    sender = data.get("sender_public_key")
    receiver = data.get("receiver_address")
    amount = data.get("amount", 50)
    
    # Fake/invalid signature
    fake_signature = "INVALID_SIGNATURE_ATTACK"
    
    result = blockchain.add_transaction(sender, receiver, amount, fake_signature)
    
    return jsonify({
        "m": "Invalid signature attack attempted",
        "attack_successful": result,
        "note": "No signature verification implemented - security vulnerability!"
    }), 200

@app.route('/attack/51-percent', methods=['POST'])
def attack_51_percent():
    if len(blockchain.chain) < 3:
        return jsonify({"m": "Bu Saldırı İçin En Az 3 Blok Gereklidir!"}), 400
    
    original_length = len(blockchain.chain)
    
    fork_point = len(blockchain.chain) - 2
    fake_chain = blockchain.chain[:fork_point]
    
    from block import Block
    for i in range(3):
        fake_block = Block(
            index=len(fake_chain),
            transactions=[{"sender": "ATTACKER", "receiver": "ATTACKER_WALLET", "amount": 9999}],
            previous_hash=fake_chain[-1].hash
        )
        fake_block.hash = fake_block.calculate_hash()
        fake_chain.append(fake_block)
    
    attack_successful = len(fake_chain) > original_length
    
    return jsonify({
        "m": "51% attack simulated",
        "original_chain_length": original_length,
        "fake_chain_length": len(fake_chain),
        "attack_would_succeed": attack_successful,
        "note": "In real blockchain, this requires controlling >50% of network hash power"
    }), 200

@app.route('/attack/fork-chain', methods=['POST'])
def attack_fork():
    data = request.get_json()
    fork_at = data.get("fork_at_block", max(1, len(blockchain.chain) - 2))
    
    if fork_at >= len(blockchain.chain):
        return jsonify({"m": "Invalid fork point"}), 400
    original_length = len(blockchain.chain)
    blockchain.chain = blockchain.chain[:fork_at + 1]
    
    return jsonify({
        "m": "Chain forked",
        "original_length": original_length,
        "forked_at": fork_at,
        "new_length": len(blockchain.chain),
        "blocks_removed": original_length - len(blockchain.chain)
    }), 200

if __name__ == '__main__':
    app.run(port=5000, debug=True)