/**
 * Module dependencies
 */

var merge = require('utils-merge');

/**
 * Transform a hal+json resource into a hyper+json representation
 *
 * @param {Object} resource
 * @return {Object}
 */

exports = module.exports = function(resource, curies) {
  curies = merge(transformCuries(get('curies', get('_links', resource), [])), curies);
  return Object.keys(resource).reduce(function(hyperObj, key) {
    var value = resource[key];
    if (key === '_links') return transformLinks(hyperObj, value, curies);
    if (key === '_embedded') return transformEmbedded(hyperObj, value, curies);
    hyperObj[key] = value;
    return hyperObj;
  }, {});
};

/**
 * Transform the curies into an Object
 *
 * @param {Array} curies
 * @return {Object}
 */

function transformCuries(curies) {
  return curies.reduce(function(acc, curie) {
    var name = get('name', curie);
    if (!name) return acc;
    acc[name] = curie;
    return acc;
  }, {});
}

/**
 * Transform the _links object
 *
 * @param {Object} hyperObj
 * @param {Object} links
 * @param {Object} curies
 * @return {Object}
 */

function transformLinks(hyperObj, links, curies) {
  Object.keys(links).forEach(function(name) {
    if (name === 'curies') return;
    var value = links[name];

    if (name === 'self') return hyperObj.href = get('href', value);
    applyCurie(hyperObj, curies, name, transformTemplated(value));
  });
  return hyperObj;
}

/**
 * Transform templated links
 *
 * @param {Object} link
 * @return {Object}
 */

function transformTemplated(link) {
  if (Array.isArray(link)) return {collection: link.map(transformTemplated)};
  // TODO support templated links
  if (link.templated) console.warn('Templated links are not supported at this time');
  return link;
}

/**
 * Transform _embedded resources
 *
 * @param {Object} hyperObj
 * @param {Object} embedded
 * @param {Object} curies
 * @return {Object}
 */

function transformEmbedded(hyperObj, embedded, curies) {
  Object.keys(embedded).forEach(function(rel) {
    applyCurie(hyperObj, curies, rel, {
      collection: embedded[rel].map(function(item) {
        return exports(item, curies);
      })
    });
  });
  return hyperObj;
}

/**
 * Apply curie transformations to a link
 *
 * @param {Object} hyperObj
 * @param {Object} curies
 * @param {String} name
 * @param {Object} link
 */

function applyCurie(hyperObj, curies, name, link) {
  var parts = name.split(':');
  if (parts.length === 1) return hyperObj[name] = link;

  var curie = get('href', curies[parts[0]]);
  if (!curie) return hyperObj[name] = link;

  var rel = parts[1];
  return hyperObj[rel] = merge({
    // TODO we need to have a formalized property in hyper+json for docs
    '//documentation': curie.replace(/\{ *rel *\}/g, rel)
  }, link);
}

/**
 * Gracefully get a value
 *
 * @param {String} key
 * @param {Any} obj
 * @param {Any} fallback
 * @return {Any}
 */

function get(key, obj, fallback) {
  if (!obj) return undefined;
  if (obj.hasOwnProperty(key)) return obj[key];
  return fallback;
}
