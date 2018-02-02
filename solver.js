#!/usr/bin/node

fs = require('fs');

if (process.argv.length < 3) {
  console.log('usage: solver.js <word_scramble>');
  process.exit(-1);
}

/* branch has turned to a dead end, get back to a branch with more leaves */
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

/* simple binary search for a string in a list of words
   returns a tuple of booleans, the first indicates whether
   the prefix is a valid word, the second whether the prefix is 
   a prefix of a valid word */
var prefixCheck = function(prefix, words) {
  var n = prefix.length;
  var last = words.length;
  var first = 0;
  while (first !== last && last - first !== 1) {
    var i = first + Math.round((last-first)/2)
    var comp = words[i];
    if (comp === prefix) {
      /* prefix itsself is a word*/
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
  return [false, (words[i].slice(0, n) === prefix)];
}

/* sorts and optionally prints a list of words ordered by
   length and sorted lexographically */
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
  /* list of all valid words */
  var words = data.split('\n');

  /* keeps track of our depth in the tree of potential words */
  var depth = 0;

  /* keeps track of the leaf we are currently checking in our tree */
  var indices = [];

  /* list of valid words made from our scramble */
  var validWords = [];

  /* initialize indices to the first char (we haven't checked any yet) */
  for (i=0;i<n;i++) {
    indices[i] = 0;
  }

  /* traverse the tree of potential words */
  while (indices[0] < n) {

    /* the string corresponding to the current leaf we are checking */
    var prefix = '';
    for (i=0;i<=depth;i++) {
      prefix = prefix+chars[indices[i]];
    }
    
    /* check the prefix to see if it is a valid word and valid prefix */  
    var result = prefixCheck(prefix, words);
    /* found a valid word */
    if (result[0] && prefix.length > 1) {
      if (prefix !== undefined && validWords.indexOf(prefix) === -1) {
        validWords.push(prefix);  
      }
      
    }

    /* reached max depth in our tree, reduce */
    if (depth >= n-1) {
      depth = reduce(depth, indices)
      /* check that there are still leaves left in tree */
      if (depth === -1) { break; }
    } 
    /* found a valid prefix, leaf becomes a branch */
    else if (result[1]) {
      depth += 1;
      /* make sure we don't use a char that is in our prefix */
      var usedIndices = indices.slice(0,depth);
      while (usedIndices.indexOf(indices[depth]) !== -1) {
        indices[depth] += 1;
      }
    } 
    /* not a valid prefix, try the next leaf, reduce if no more leaves are available on
       this branch */
    else {
      var usedIndices = indices.slice(0,depth);
      do {
        indices[depth] += 1;
        /* all chars at this depth with this prefix have been exhausted */
        if (indices[depth] > n-1) {
          depth = reduce(depth, indices);
          break;
        }  
      } while (usedIndices.indexOf(indices[depth]) !== -1);
      /* check that there are still leaves left in tree */
      if (depth = -1) { break; }
    }
  }

  lengthFormat(validWords, true);
});

