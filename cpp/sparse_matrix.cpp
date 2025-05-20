#include <iostream>
#include <vector>
#include <cstddef>
#include <utility>
#include <stdexcept>

/**
 * SparseMatrix class that efficiently stores only non-zero values
 * using a custom hash table implementation for O(1) average access time.
 */
class SparseMatrix {
private:
    // Node structure for our linked list in each hash bucket
    struct Node {
        int row;
        int col;
        double value;
        Node* next;
        
        Node(int r, int c, double v) : row(r), col(c), value(v), next(nullptr) {}
    };
    
    // Hash table size (number of buckets)
    static const size_t TABLE_SIZE = 997; // A prime number for better distribution
    
    // Array of linked lists (hash table)
    Node* buckets[TABLE_SIZE];
    
    // Count of non-zero elements
    size_t nonZeroElements;
    
    // Hash function to determine bucket index
    size_t hash(int row, int col) const {
        // Cantor pairing function to map 2D coordinates to 1D
        size_t k1 = static_cast<size_t>(row);
        size_t k2 = static_cast<size_t>(col);
        size_t cantor = ((k1 + k2) * (k1 + k2 + 1)) / 2 + k2;
        return cantor % TABLE_SIZE;
    }
    
    // Helper method to find a node or its predecessor
    Node* findNode(int row, int col, Node** prev = nullptr) const {
        size_t index = hash(row, col);
        Node* current = buckets[index];
        Node* previous = nullptr;
        
        while (current != nullptr) {
            if (current->row == row && current->col == col) {
                if (prev != nullptr) {
                    *prev = previous;
                }
                return current;
            }
            previous = current;
            current = current->next;
        }
        
        if (prev != nullptr) {
            *prev = previous;
        }
        return nullptr;
    }
    
    // Clean up all allocated nodes
    void cleanup() {
        for (size_t i = 0; i < TABLE_SIZE; ++i) {
            Node* current = buckets[i];
            while (current != nullptr) {
                Node* next = current->next;
                delete current;
                current = next;
            }
            buckets[i] = nullptr;
        }
        nonZeroElements = 0;
    }

public:
    // Iterator class for traversing non-zero elements
    class Iterator {
    private:
        const SparseMatrix* matrix;
        size_t currentBucket;
        Node* currentNode;
        
        // Find the first non-null node starting from the current bucket
        void findNextNode() {
            while (currentBucket < TABLE_SIZE) {
                if (currentNode != nullptr) {
                    return;
                }
                currentBucket++;
                if (currentBucket < TABLE_SIZE) {
                    currentNode = matrix->buckets[currentBucket];
                }
            }
        }
        
    public:
        Iterator(const SparseMatrix* m, bool begin) : matrix(m), currentBucket(0), currentNode(nullptr) {
            if (begin) {
                // Start at the first bucket
                currentNode = matrix->buckets[0];
                findNextNode();
            } else {
                // End iterator
                currentBucket = TABLE_SIZE;
            }
        }
        
        // Dereference operator returns a tuple of (row, col, value)
        std::tuple<int, int, double> operator*() const {
            if (currentNode == nullptr) {
                throw std::out_of_range("Iterator out of range");
            }
            return std::make_tuple(currentNode->row, currentNode->col, currentNode->value);
        }
        
        // Pre-increment operator
        Iterator& operator++() {
            if (currentNode != nullptr) {
                currentNode = currentNode->next;
                findNextNode();
            }
            return *this;
        }
        
        // Equality comparison
        bool operator==(const Iterator& other) const {
            return (currentBucket == other.currentBucket && currentNode == other.currentNode);
        }
        
        // Inequality comparison
        bool operator!=(const Iterator& other) const {
            return !(*this == other);
        }
    };
    
    // Constructor
    SparseMatrix() : nonZeroElements(0) {
        // Initialize all buckets to nullptr
        for (size_t i = 0; i < TABLE_SIZE; ++i) {
            buckets[i] = nullptr;
        }
    }
    
    // Destructor
    ~SparseMatrix() {
        cleanup();
    }
    
    // Copy constructor
    SparseMatrix(const SparseMatrix& other) : nonZeroElements(0) {
        // Initialize all buckets to nullptr
        for (size_t i = 0; i < TABLE_SIZE; ++i) {
            buckets[i] = nullptr;
        }
        
        // Copy all non-zero elements from other matrix
        for (auto it = other.begin(); it != other.end(); ++it) {
            int row, col;
            double value;
            std::tie(row, col, value) = *it;
            set(row, col, value);
        }
    }
    
    // Move constructor
    SparseMatrix(SparseMatrix&& other) noexcept : nonZeroElements(other.nonZeroElements) {
        // Move buckets from other matrix
        for (size_t i = 0; i < TABLE_SIZE; ++i) {
            buckets[i] = other.buckets[i];
            other.buckets[i] = nullptr;
        }
        other.nonZeroElements = 0;
    }
    
    // Copy assignment operator
    SparseMatrix& operator=(const SparseMatrix& other) {
        if (this != &other) {
            // Clean up existing data
            cleanup();
            
            // Copy all non-zero elements from other matrix
            for (auto it = other.begin(); it != other.end(); ++it) {
                int row, col;
                double value;
                std::tie(row, col, value) = *it;
                set(row, col, value);
            }
        }
        return *this;
    }
    
    // Move assignment operator
    SparseMatrix& operator=(SparseMatrix&& other) noexcept {
        if (this != &other) {
            // Clean up existing data
            cleanup();
            
            // Move buckets from other matrix
            nonZeroElements = other.nonZeroElements;
            for (size_t i = 0; i < TABLE_SIZE; ++i) {
                buckets[i] = other.buckets[i];
                other.buckets[i] = nullptr;
            }
            other.nonZeroElements = 0;
        }
        return *this;
    }
    
    // Set a value at the specified position
    void set(int row, int col, double value) {
        // Find the node if it exists
        Node* prev = nullptr;
        Node* node = findNode(row, col, &prev);
        
        if (value == 0.0) {
            // If setting to zero, remove the node if it exists
            if (node != nullptr) {
                size_t index = hash(row, col);
                if (prev == nullptr) {
                    // Node is the first in the bucket
                    buckets[index] = node->next;
                } else {
                    // Node is in the middle or end of the list
                    prev->next = node->next;
                }
                delete node;
                nonZeroElements--;
            }
        } else {
            if (node != nullptr) {
                // Update existing node
                node->value = value;
            } else {
                // Create a new node
                size_t index = hash(row, col);
                Node* newNode = new Node(row, col, value);
                
                // Insert at the beginning of the bucket
                newNode->next = buckets[index];
                buckets[index] = newNode;
                nonZeroElements++;
            }
        }
    }
    
    // Get a value at the specified position
    double get(int row, int col) const {
        Node* node = findNode(row, col);
        return (node != nullptr) ? node->value : 0.0;
    }
    
    // Get the count of non-zero elements
    size_t nonZeroCount() const {
        return nonZeroElements;
    }
    
    // Create a transposed matrix
    SparseMatrix transpose() const {
        SparseMatrix result;
        
        // Iterate through all non-zero elements and add them to the result with swapped indices
        for (auto it = begin(); it != end(); ++it) {
            int row, col;
            double value;
            std::tie(row, col, value) = *it;
            result.set(col, row, value);
        }
        
        return result;
    }
    
    // Iterator methods
    Iterator begin() const {
        return Iterator(this, true);
    }
    
    Iterator end() const {
        return Iterator(this, false);
    }
    
    // Print the matrix (for debugging)
    void print(int maxRow = 10, int maxCol = 10) const {
        std::cout << "SparseMatrix with " << nonZeroElements << " non-zero elements:" << std::endl;
        
        // Print a grid representation
        for (int i = 0; i < maxRow; ++i) {
            for (int j = 0; j < maxCol; ++j) {
                std::cout << get(i, j) << "\t";
            }
            std::cout << std::endl;
        }
    }
};

int main() {
    // Create a sparse matrix
    SparseMatrix matrix;
    
    // Test set and get operations
    std::cout << "Testing set and get operations:" << std::endl;
    matrix.set(0, 0, 1.0);
    matrix.set(1, 1, 2.0);
    matrix.set(2, 2, 3.0);
    matrix.set(5, 10, 4.0);
    matrix.set(10, 5, 5.0);
    
    std::cout << "Value at (0,0): " << matrix.get(0, 0) << std::endl;
    std::cout << "Value at (1,1): " << matrix.get(1, 1) << std::endl;
    std::cout << "Value at (2,2): " << matrix.get(2, 2) << std::endl;
    std::cout << "Value at (5,10): " << matrix.get(5, 10) << std::endl;
    std::cout << "Value at (10,5): " << matrix.get(10, 5) << std::endl;
    std::cout << "Value at (3,3) (should be 0): " << matrix.get(3, 3) << std::endl;
    
    // Test nonZeroCount
    std::cout << "\nNon-zero count: " << matrix.nonZeroCount() << std::endl;
    
    // Test setting a value to zero
    std::cout << "\nSetting (1,1) to 0..." << std::endl;
    matrix.set(1, 1, 0.0);
    std::cout << "Value at (1,1) (should be 0): " << matrix.get(1, 1) << std::endl;
    std::cout << "Non-zero count (should be 4): " << matrix.nonZeroCount() << std::endl;
    
    // Test iterator
    std::cout << "\nIterating over non-zero elements:" << std::endl;
    for (auto it = matrix.begin(); it != matrix.end(); ++it) {
        int row, col;
        double value;
        std::tie(row, col, value) = *it;
        std::cout << "(" << row << "," << col << ") = " << value << std::endl;
    }
    
    // Test transpose
    std::cout << "\nCreating transposed matrix..." << std::endl;
    SparseMatrix transposed = matrix.transpose();
    
    std::cout << "Original matrix:" << std::endl;
    matrix.print();
    
    std::cout << "\nTransposed matrix:" << std::endl;
    transposed.print();
    
    // Verify transposition
    std::cout << "\nVerifying transposition:" << std::endl;
    std::cout << "Original (5,10) = " << matrix.get(5, 10) << ", Transposed (10,5) = " << transposed.get(10, 5) << std::endl;
    std::cout << "Original (10,5) = " << matrix.get(10, 5) << ", Transposed (5,10) = " << transposed.get(5, 10) << std::endl;
    
    // Test copy constructor
    std::cout << "\nTesting copy constructor..." << std::endl;
    SparseMatrix copy(matrix);
    std::cout << "Copy non-zero count: " << copy.nonZeroCount() << std::endl;
    std::cout << "Copy value at (0,0): " << copy.get(0, 0) << std::endl;
    
    // Test move constructor
    std::cout << "\nTesting move constructor..." << std::endl;
    SparseMatrix moved(std::move(copy));
    std::cout << "Moved non-zero count: " << moved.nonZeroCount() << std::endl;
    std::cout << "Moved value at (0,0): " << moved.get(0, 0) << std::endl;
    std::cout << "Original copy non-zero count (should be 0): " << copy.nonZeroCount() << std::endl;
    
    return 0;
}