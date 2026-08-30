import assert from "node:assert/strict";

import {
  filterPainFriendlyCatalog,
  findActiveAnchor,
} from "../src/utils/catalog-scroll.ts";

const anchors = [
  { id: "a", top: 20 },
  { id: "b", top: 100 },
  { id: "c", top: 240 },
];

assert.equal(findActiveAnchor([], 0), "");
assert.equal(findActiveAnchor(anchors, 0), "a");
assert.equal(findActiveAnchor(anchors, 100), "b");
assert.equal(findActiveAnchor(anchors, 999), "c");
assert.equal(findActiveAnchor(anchors, 100, true), "c");

const product = (id: string, painFriendly: boolean) => ({
  id,
  name: id,
  subTitle: "",
  cover: "",
  originalPrice: 0,
  price: 0,
  sales: 0,
  painFriendly,
  tags: [],
});
const fullCatalog = {
  groups: [
    {
      id: "fixed",
      name: "固定分组",
      fixed: true,
      sections: [
        {
          id: "fixed",
          name: "固定分组",
          total: 1,
          products: [product("fixed-normal", false)],
        },
      ],
    },
    {
      id: "g1",
      name: "一类",
      sections: [
        {
          id: "s1",
          name: "一组",
          total: 2,
          products: [product("friendly", true), product("normal", false)],
        },
        { id: "s2", name: "空组", total: 1, products: [product("normal-2", false)] },
      ],
    },
    { id: "g2", name: "空分类", sections: [] },
  ],
};

assert.equal(filterPainFriendlyCatalog(fullCatalog, false), fullCatalog);
assert.deepEqual(
  filterPainFriendlyCatalog(fullCatalog, true).groups.map((group) => [
    group.id,
    group.sections.map((section) => [
      section.id,
      section.total,
      section.products.map((item) => item.id),
    ]),
  ]),
  [
    ["fixed", [["fixed", 0, []]]],
    ["g1", [["s1", 1, ["friendly"]]]],
  ]
);
