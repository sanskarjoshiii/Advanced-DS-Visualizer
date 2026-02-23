#include "huffman_tree.h"
#include <unordered_map>
#include <algorithm>

void HuffmanTree::buildFromString(const std::string& text) {
    if (text.empty()) {
        root = nullptr;
        return;
    }

    std::unordered_map<char, int> freq;
    for (unsigned char c : text) {
        freq[c]++;
    }

    std::priority_queue<std::shared_ptr<HuffmanNode>, std::vector<std::shared_ptr<HuffmanNode>>, CompareHuffman> pq;
    for (const auto& p : freq) {
        pq.push(std::make_shared<HuffmanNode>(p.first, p.second));
    }

    if (pq.size() == 1) {
        auto only = pq.top();
        pq.pop();
        root = std::make_shared<HuffmanNode>('\0', only->freq);
        root->left = only;
        return;
    }

    while (pq.size() > 1) {
        auto left = pq.top();
        pq.pop();
        auto right = pq.top();
        pq.pop();
        auto internal = std::make_shared<HuffmanNode>('\0', left->freq + right->freq);
        internal->left = left;
        internal->right = right;
        pq.push(internal);
    }

    root = pq.top();
}

crow::json::wvalue HuffmanTree::nodeToJson(std::shared_ptr<HuffmanNode> node) {
    if (!node) return nullptr;

    crow::json::wvalue json;
    if (node->ch != '\0') {
        json["char"] = std::string(1, node->ch);
    } else {
        json["char"] = "";
    }
    json["freq"] = node->freq;
    json["left"] = nodeToJson(node->left);
    json["right"] = nodeToJson(node->right);

    return json;
}

crow::json::wvalue HuffmanTree::toJson() {
    return nodeToJson(root);
}
