const { ethers } = require("ethers");

module.exports = class MerkleTree {
  elements;
  layers;

  constructor(elements) {
    const parsedElements = elements.map(([address, balance]) => {
      return this._encodeElement(address, BigInt(balance));
    });

    this.elements = parsedElements
      .filter((el) => el)
      .map((el) => this._stringToBuffer(el));

    // Sort elements
    this.elements.sort(Buffer.compare);
    // Deduplicate elements
    this.elements = this.bufDedup(this.elements);

    // Create layers
    this.layers = this.getLayers(this.elements);
  }

  getLayers(elements) {
    if (elements.length === 0) {
      return [[""]];
    }

    const layers = [];
    layers.push(elements);

    // Get next layer until we reach the root
    while (layers[layers.length - 1].length > 1) {
      layers.push(this.getNextLayer(layers[layers.length - 1]));
    }

    return layers;
  }

  getNextLayer(elements) {
    return elements.reduce((layer, el, idx, arr) => {
      if (idx % 2 === 0) {
        // Hash the current element with its pair element
        layer.push(this.combinedHash(el, arr[idx + 1]));
      }

      return layer;
    }, []);
  }

  combinedHash(first, second) {
    if (!first) {
      return second;
    }
    if (!second) {
      return first;
    }

    return this._stringToBuffer(
      ethers.keccak256(this.sortAndConcat(first, second))
    );
  }

  getRoot() {
    return this.layers[this.layers.length - 1][0];
  }

  getHexRoot() {
    return "0x".concat(this.getRoot().toString("hex"));
  }

  getProof(el) {
    let idx = this.bufIndexOf(el, this.elements);

    if (idx === -1) {
      throw new Error("Element does not exist in Merkle tree");
    }

    return this.layers.reduce((proof, layer) => {
      const pairElement = this.getPairElement(idx, layer);

      if (pairElement) {
        proof.push(pairElement);
      }

      idx = Math.floor(idx / 2);

      return proof;
    }, []);
  }

  // external call - convert to buffer
  getHexProof(_el) {
    const [address, balance] = _el;
    const encoded = this._encodeElement(address, BigInt(balance));
    const el = Buffer.from(ethers.getBytes(encoded));

    const proof = this.getProof(el);

    return this.bufArrToHexArr(proof);
  }

  getPairElement(idx, layer) {
    const pairIdx = idx % 2 === 0 ? idx + 1 : idx - 1;

    if (pairIdx < layer.length) {
      return layer[pairIdx];
    } else {
      return null;
    }
  }

  bufIndexOf(el, arr) {
    let hash;

    // Convert element to 32 byte hash if it is not one already
    if (el.length !== 32 || !Buffer.isBuffer(el)) {
      hash = this._stringToBuffer(ethers.keccak256(el));
    } else {
      hash = el;
    }

    for (let i = 0; i < arr.length; i++) {
      if (hash.equals(arr[i])) {
        return i;
      }
    }

    return -1;
  }

  bufDedup(elements) {
    return elements.filter((el, idx) => {
      return idx === 0 || !elements[idx - 1].equals(el);
    });
  }

  bufArrToHexArr(arr) {
    if (arr.some((el) => !Buffer.isBuffer(el))) {
      throw new Error("Array is not an array of buffers");
    }

    return arr.map((el) => "0x" + el.toString("hex"));
  }

  sortAndConcat(...args) {
    return Buffer.concat([...args].sort(Buffer.compare));
  }

  _stringToBuffer(str) {
    return Buffer.from(ethers.getBytes(str));
  }

  _encodeElement(address, balance) {
    return ethers.solidityPackedKeccak256(
      ["address", "uint"],
      [address, balance]
    );
  }
};
