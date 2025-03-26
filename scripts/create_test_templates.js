import Handlebars from "handlebars";
import { writeFileSync } from "fs";

let template = "Handlebars <b>{{doesWhat}}</b> precompiled!";
let compiled = Handlebars.precompile(template);
writeFileSync("./test_data/demo1.js", compiled);

template = '<div class="entry">{{#if author}}<h1>{{firstName}} {{lastName}}</h1>{{/if}}</div>'
compiled = Handlebars.precompile(template);

writeFileSync("./test_data/demo2.js", compiled);
template = '{{#if isActive}}  <img src="star.gif" alt="Active">{{else}}  <img src="cry.gif" alt="Inactive">{{/if}}'
compiled = Handlebars.precompile(template);

writeFileSync("./test_data/demo3.js", compiled);
template = '<div class="entry">{{#unless license}}<h3 class="warning">WARNING: This entry does not have a license!</h3>{{/unless}}</div>'
compiled = Handlebars.precompile(template);

writeFileSync("./test_data/demo4.js", compiled);
template = '<ul class="people_list">  {{#each people}}    <li>{{this}}</li>  {{/each}}</ul>'
compiled = Handlebars.precompile(template);
writeFileSync("./test_data/demo5.js", compiled);
template = '{{#with person}}{{firstname}} {{lastname}}{{/with}}'
compiled = Handlebars.precompile(template);
writeFileSync("./test_data/demo6.js", compiled);
template = '{{#list nav id="nav-bar" class="top"}}  <a href="{{url}}">{{title}}</a>{{/list}}'
compiled = Handlebars.precompile(template);
writeFileSync("./test_data/demo7.js", compiled);