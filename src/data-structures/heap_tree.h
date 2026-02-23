#ifndef HEAP_TREE_H
#define HEAP_TREE_H

#include <vector>
#include <crow/json.h>

class HeapTree {
private:
    std::vector<int> heap;

    void heapifyUp(int index);
    void heapifyDown(int index);
    int parent(int i) const { return (i - 1) / 2; }
    int leftChild(int i) const { return 2 * i + 1; }
    int rightChild(int i) const { return 2 * i + 2; }

public:
    HeapTree() = default;
    void insert(int value);
    int extractMin();
    bool isEmpty() const { return heap.empty(); }
    crow::json::wvalue toJson();
};

#endif
