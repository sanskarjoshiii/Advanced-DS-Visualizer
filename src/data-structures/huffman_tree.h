#ifndef HUFFMAN_TREE_H
#define HUFFMAN_TREE_H

#include <memory>
#include <string>
#include <queue>
#include <vector>
#include <crow/json.h>

struct HuffmanNode {
    char ch;
    int freq;
    std::shared_ptr<HuffmanNode> left;
    std::shared_ptr<HuffmanNode> right;

    HuffmanNode(char c, int f) : ch(c), freq(f), left(nullptr), right(nullptr) {}
};

struct CompareHuffman {
    bool operator()(const std::shared_ptr<HuffmanNode>& a, const std::shared_ptr<HuffmanNode>& b) {
        return a->freq > b->freq;
    }
};

class HuffmanTree {
private:
    std::shared_ptr<HuffmanNode> root;

    crow::json::wvalue nodeToJson(std::shared_ptr<HuffmanNode> node);

public:
    HuffmanTree() : root(nullptr) {}
    void buildFromString(const std::string& text);
    crow::json::wvalue toJson();
};

#endif
