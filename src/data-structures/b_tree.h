#ifndef B_TREE_H
#define B_TREE_H

#include <vector>
#include <memory>
#include <crow/json.h>

const int B_TREE_ORDER = 3;

struct BTreeNode {
    bool isLeaf;
    std::vector<int> keys;
    std::vector<std::shared_ptr<BTreeNode>> children;

    BTreeNode(bool leaf = true) : isLeaf(leaf) {}
};

class BTree {
private:
    std::shared_ptr<BTreeNode> root;

    void insertNonFull(std::shared_ptr<BTreeNode> node, int key);
    void splitChild(std::shared_ptr<BTreeNode> parent, int i);
    bool searchNode(std::shared_ptr<BTreeNode> node, int key);
    void removeNode(std::shared_ptr<BTreeNode> node, int key);
    int findKey(std::shared_ptr<BTreeNode> node, int key);
    void removeFromLeaf(std::shared_ptr<BTreeNode> node, int idx);
    void removeFromNonLeaf(std::shared_ptr<BTreeNode> node, int idx);
    int getPred(std::shared_ptr<BTreeNode> node, int idx);
    int getSucc(std::shared_ptr<BTreeNode> node, int idx);
    void fill(std::shared_ptr<BTreeNode> node, int idx);
    void borrowFromPrev(std::shared_ptr<BTreeNode> node, int idx);
    void borrowFromNext(std::shared_ptr<BTreeNode> node, int idx);
    void merge(std::shared_ptr<BTreeNode> node, int idx);
    crow::json::wvalue nodeToJson(std::shared_ptr<BTreeNode> node);

public:
    BTree() : root(nullptr) {}
    void insert(int key);
    void remove(int key);
    bool search(int key);
    crow::json::wvalue toJson();
};

#endif
