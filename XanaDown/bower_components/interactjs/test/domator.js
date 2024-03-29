import domator from 'domator';
let JSDOM;
let doc;
if (typeof window === 'undefined') {
    // tslint:disable-next-line no-var-requires
    JSDOM = require('jsdom').JSDOM;
    doc = new JSDOM('<!DOCTYPE html><html><body></body></html>').window.document;
}
else {
    doc = window.document;
}
domator.setDocument(doc);
export { domator, doc, JSDOM, };
export default domator;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZG9tYXRvci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRvbWF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxPQUFPLE1BQU0sU0FBUyxDQUFBO0FBRTdCLElBQUksS0FBSyxDQUFBO0FBQ1QsSUFBSSxHQUFHLENBQUE7QUFFUCxJQUFJLE9BQU8sTUFBTSxLQUFLLFdBQVcsRUFBRTtJQUNqQywyQ0FBMkM7SUFDM0MsS0FBSyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUE7SUFDOUIsR0FBRyxHQUFHLElBQUksS0FBSyxDQUFDLDJDQUEyQyxDQUFDLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQTtDQUM3RTtLQUFNO0lBQ0wsR0FBRyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUE7Q0FDdEI7QUFFRCxPQUFPLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBRXhCLE9BQU8sRUFDTCxPQUFPLEVBQ1AsR0FBRyxFQUNILEtBQUssR0FDTixDQUFBO0FBRUQsZUFBZSxPQUFPLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZG9tYXRvciBmcm9tICdkb21hdG9yJ1xuXG5sZXQgSlNET01cbmxldCBkb2NcblxuaWYgKHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnKSB7XG4gIC8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZSBuby12YXItcmVxdWlyZXNcbiAgSlNET00gPSByZXF1aXJlKCdqc2RvbScpLkpTRE9NXG4gIGRvYyA9IG5ldyBKU0RPTSgnPCFET0NUWVBFIGh0bWw+PGh0bWw+PGJvZHk+PC9ib2R5PjwvaHRtbD4nKS53aW5kb3cuZG9jdW1lbnRcbn0gZWxzZSB7XG4gIGRvYyA9IHdpbmRvdy5kb2N1bWVudFxufVxuXG5kb21hdG9yLnNldERvY3VtZW50KGRvYylcblxuZXhwb3J0IHtcbiAgZG9tYXRvcixcbiAgZG9jLFxuICBKU0RPTSxcbn1cblxuZXhwb3J0IGRlZmF1bHQgZG9tYXRvclxuIl19