class Rectangle {
    constructor(minX, minY, maxX, maxY) {
        this.minX = minX;
        this.minY = minY;
        this.maxX = maxX;
        this.maxY = maxY;
    }

    overlaps(other) {
        return this.minX <= other.maxX && this.maxX >= other.minX &&
               this.minY <= other.maxY && this.maxY >= other.minY;
    }

    contains(rectangle) {
        return this.minX <= rectangle.minX && this.maxX >= rectangle.maxX &&
               this.minY <= rectangle.minY && this.maxY >= rectangle.maxY;
    }

    expand(rectangle) {
        this.minX = Math.min(this.minX, rectangle.minX);
        this.minY = Math.min(this.minY, rectangle.minY);
        this.maxX = Math.max(this.maxX, rectangle.maxX);
        this.maxY = Math.max(this.maxY, rectangle.maxY);
    }
}

class RTreeNode {
    constructor(maxEntries = 4, minEntries = 2) {
        this.maxEntries = maxEntries;
        this.minEntries = minEntries;
        this.entries = [];
        this.rectangle = new Rectangle(Infinity, Infinity, -Infinity, -Infinity);
    }

    insert(rectangle) {
        this.entries.push(rectangle);
        this.rectangle.expand(rectangle);
        if (this.entries.length > this.maxEntries) {
            return this.split();
        }
        return null;
    }

    split() {
        // Simple split strategy for demonstration purposes
        const half = Math.ceil(this.entries.length / 2);
        const node1 = new RTreeNode(this.maxEntries, this.minEntries);
        const node2 = new RTreeNode(this.maxEntries, this.minEntries);

        this.entries.sort((a, b) => a.minX - b.minX); // Sort by minX for splitting

        for (let i = 0; i < this.entries.length; i++) {
            if (i < half) {
                node1.insert(this.entries[i]);
            } else {
                node2.insert(this.entries[i]);
            }
        }

        return [node1, node2];
    }

    search(rectangle, found = []) {
        if (!this.rectangle.overlaps(rectangle)) {
            return found;
        }
        this.entries.forEach(entry => {
            if (entry instanceof Rectangle) {
                if (rectangle.overlaps(entry)) {
                    found.push(entry);
                }
            } else {
                entry.search(rectangle, found);
            }
        });
        return found;
    }


    delete(rectangle) {
        for (let i = 0; i < this.entries.length; i++) {
            const entry = this.entries[i];
            if (entry === rectangle || (entry instanceof RTreeNode && entry.rectangle.contains(rectangle))) {
                if (entry instanceof RTreeNode) {
                    // Recursively delete and check for underflow
                    if (entry.delete(rectangle)) {
                        if (entry.entries.length < entry.minEntries) {
                            return this.handleUnderflow(i);
                        }
                    }
                } else {
                    this.entries.splice(i, 1);
                    return this.entries.length < this.minEntries;
                }
            }
        }
        return false;
    }
    handleUnderflow(index) {
        // For simplicity, we'll merge with a sibling (previous or next)
        const node = this.entries[index];
        let siblingIndex = index > 0 ? index - 1 : index + 1;
        let sibling = this.entries[siblingIndex];

        if (sibling.entries.length + node.entries.length <= this.maxEntries) {
            // Merge node with sibling
            sibling.entries.push(...node.entries);
            sibling.entries.forEach(entry => sibling.rectangle.expand(entry.rectangle));
            this.entries.splice(index, 1); // Remove the underflowed node
        } else {
            // Redistribute entries between node and sibling
            // This is a basic implementation; more advanced strategies could be employed
            while (node.entries.length < this.minEntries) {
                const entry = sibling.entries.pop();
                node.entries.unshift(entry);
                node.rectangle.expand(entry.rectangle);
            }
            sibling.rectangle = new Rectangle(Infinity, Infinity, -Infinity, -Infinity);
            sibling.entries.forEach(entry => sibling.rectangle.expand(entry.rectangle));
        }

        return this.entries.length < this.minEntries;
    }
}

class RTree {
    constructor(maxEntries = 4, minEntries = 2) {
        this.root = new RTreeNode(maxEntries, minEntries);
    }

    insert(minX, minY, maxX, maxY) {
        const rectangle = new Rectangle(minX, minY, maxX, maxY);
        const splitNodes = this.root.insert(rectangle);
        if (splitNodes) {
            const newRoot = new RTreeNode(this.root.maxEntries, this.root.minEntries);
            newRoot.entries.push(splitNodes[0], splitNodes[1]);
            newRoot.rectangle.expand(splitNodes[0].rectangle);
            newRoot.rectangle.expand(splitNodes[1].rectangle);
            this.root = newRoot;
        }
        visualizeRTree(this);
    }

    search(minX, minY, maxX, maxY) {
        const rectangle = new Rectangle(minX, minY, maxX, maxY);
        visualizeRTree(this);
        visualizeRectangle(rectangle)
        return this.root.search(rectangle);
    }

    delete(minX, minY, maxX, maxY) {
        const rectangle = new Rectangle(minX, minY, maxX, maxY);
        visualizeRTree(this);
        return this.root.delete(rectangle);
    }

}

// Example usage
const rtree = new RTree(4, 2); // Max entries 4, Min entries 2
rtree.insert(10, 10, 20, 20);
rtree.insert(15, 15, 30, 30);
rtree.insert(1, 1, 8, 8);
rtree.insert(24, 24, 30, 30);
rtree.insert(22, 22, 28, 28);

const results = rtree.search(15, 15,30, 30);
console.log('Search Results:', results);

//rtree.delete(10, 10, 20, 20);
console.log('Tree after Deletion:', rtree.root);
function drawRectangle(ctx, rectangle, color = 'black') {
    ctx.beginPath();
    ctx.rect(rectangle.minX, rectangle.minY, rectangle.maxX - rectangle.minX, rectangle.maxY - rectangle.minY);
    ctx.strokeStyle = color;
    ctx.stroke();
}

function drawTree(ctx, node, level = 0) {
    const colors = ['red', 'green', 'blue', 'purple', 'orange'];
    const color = colors[level % colors.length];

    node.entries.forEach(entry => {
        if (entry instanceof RTreeNode) {
            drawTree(ctx, entry, level + 1);
        } else {
            drawRectangle(ctx, entry, color);
        }
    });

    drawRectangle(ctx, node.rectangle, 'black'); // Draw the bounding box for the node
}

function visualizeRTree(rTree) {
    const canvas = document.getElementById('rTreeCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    drawTree(ctx, rTree.root);
}
function visualizeRectangle(rect){
    const canvas = document.getElementById('rTreeCanvas');
    const ctx = canvas.getContext('2d');
    drawRectangle(ctx, rect, 'blue'); // Draw the bounding box for the node
    
}




