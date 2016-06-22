#!/usr/bin/node

fs = require('fs');

if (process.argv.length < 3) {
  console.log('usage: solver.js <word_scramble>');
  process.exit(-1);
}

var reduce = function(depth, indices) {
  if (depth === 0) { return -1 }
  indices[depth] = 0;
  depth -= 1;
  var usedIndices = indices.slice(0,depth);
  do {
    indices[depth] += 1;
    if (indices[depth] > n-1) {
      return reduce(depth, indices)
    }  
  } while (usedIndices.indexOf(indices[depth]) !== -1);
  return depth;
}

var prefixCheck = function(prefix, words) {
  var n = prefix.length;
  var last = words.length;
  var first = 0;
  while (first !== last && last - first !== 1) {
    var i = first + Math.round((last-first)/2)
    var comp = words[i];
    if (comp === prefix) {
      return [true, (i < words.length-1 && words[i+1].slice(0, n) === prefix)]
    } else if (comp > prefix) {
      last = i;
    } else if (comp < prefix) {
      first = i;
    }
    
  }
  var i;
  if (words[first].slice(0,n) === prefix) {
    i = first;
  } else {
    i = last;
  }
  return [false, (words[last].slice(0, n) === prefix)];
}

var lengthFormat = function(words, print) {
  var i;
  var n = 0;
  for (i=0;i<words.length;i++) {
    if (words[i].length > n) {
      n = words[i].length;
    }
  }

  var sizedWords = [];
  for (i=0;i<n;i++) {
    sizedWords[i] = [];
  }

  for (i=0;i<words.length;i++) {
    sizedWords[words[i].length-1].push(words[i]);
  }

  var lengthSorted = [];
  for (i=0;i<n;i++) {
    var sorted = sizedWords[i].sort()
    lengthSorted = lengthSorted.concat(sorted);
    if (print && sorted.length > 0) {
      console.log('\n' + (i+1) + ' Letter Words:')
      console.log(sorted);
    }
  }  

  return lengthSorted;
}

var i;
var word = process.argv[2];
var chars = word.split('');
var n = word.length;

fs.readFile('./words', 'utf8', function(err, data) {
  var words = data.split('\n');
  var depth = 0;
  var indices = [];
  var validWords = [];
  var prefix = [];

  for (i=0;i<n;i++) {
    indices[i] = 0;
  }

  while (indices[0] < n) {
    prefix = '';
    for (i=0;i<=depth;i++) {
      prefix = prefix+chars[indices[i]];
    }
    
    /* check if prefix is a word 
     * if it's not, but is a valid prefix, add a new char on
     * if not and not a valid prefix, pop the char and add the next char */  
    var result = prefixCheck(prefix, words);
    if (result[0] && prefix.length > 2) {
      if (prefix !== undefined && validWords.indexOf(prefix) === -1) {
        validWords.push(prefix);  
      }
      
    }
    if (depth >= n-1) {
      depth = reduce(depth, indices)
      if (depth === -1) { break; }
    } else if (result[1]) {
      depth += 1;
      var usedIndices = indices.slice(0,depth);
      while (usedIndices.indexOf(indices[depth]) !== -1) {
        indices[depth] += 1;
      }
    } else {
      var usedIndices = indices.slice(0,depth);
      do {
        indices[depth] += 1;
        if (indices[depth] > n-1) {
          depth = reduce(depth, indices);
          break;
        }  
      } while (usedIndices.indexOf(indices[depth]) !== -1);
    }
  }

  lengthFormat(validWords, true);
});

