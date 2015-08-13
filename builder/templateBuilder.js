var _ = require('lodash');

function TemplateBuilder(){

    var templateString = '';

    this.li = function(attrName, attrValue){
        templateString += attrName ? '<li ' + attrName + '="' + attrValue + '">' : '<li>';
        return this;
    };

    this.closeLi = function(){
        templateString += '</li>';
        return this;
    };

    this.mark = function(){
        templateString += '<%= mark %>';
        return this;
    };

    this.name = function(){
        templateString += '<%= name %>';
        return this;
    };

    this.duration = function(){
        templateString += ' (<%= duration %> s)';
        return this;
    };

    this.reason = function(){
        templateString += '<%= reason %>';
        return this;
    };

    this.additionalMessage = function(){
        templateString += '<%= additionalMessage %>';
        return this;
    };

    this.a = function(){
        templateString += '<a href="<%= filename %>">';
        return this;
    };

    this.closeA = function(){
        templateString += '</a>';
        return this;
    };

    this.addText = function(text){
        templateString += text;
        return this;
    };

    this.build = function(){
        var template = _.template(
            templateString
        );
        templateString = '';
        return template;
    }
}

module.exports = TemplateBuilder;
