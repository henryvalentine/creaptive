/**
 * generate projection object for mongoose
 * @param  {Object} fieldASTs
 * @return {projections}
 */
// export default function mongooseProjection (fieldASTs) {
//   return fieldASTs.fieldNodes[0].selectionSet.selections.reduce((projections, selection) => {
//     projections[selection.name.value] = true;
//     return projections;
//   }, {});
// }

export default (fieldASTs) => {
  return fieldASTs.selectionSet.selections.reduce((projections, selection) => {
    projections[selection.name.value] = 1;
    return projections;
  }, {});
}