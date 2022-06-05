export {}
const {ServiceProvider} = require('@osjs/common') // Optional: Use the official base class

//declare var require: any

var jsep = require("jsep")
var assert = require('assert')
var ipRangeCheck = require("ip-range-check")

jsep.addBinaryOp("+", 11)
jsep.addBinaryOp("or", 12)
jsep.addBinaryOp("and", 11)
jsep.addBinaryOp("eq", 10)
jsep.addUnaryOp("not", 2)

var functions =
  {
    "hasrole": function (...args) {
      return ((this.user.roles.filter(value => -1 !== args.indexOf(value))).length > 0) //list intersection https://stackoverflow.com/a/1885569
    },
    "default": function (...args) {
      console.log(args)
      var result = (args[0] != null ? args[0] : args[1])
      console.log("returning", result)
      return result
    },

    "username": function (...args) {
      return (args.indexOf(this.user.username) != -1)
    },
    "if": function (...args) {
      //console.log(args)
      if (args[0].type === 'Literal') args[0] = args[0].value
      return ((args[0] && args[1]) || args[2])

      //throw {stopped:true, value:args}
    },
    "between": function (...args) {
      assert((args.length == 2), "between expects 2 args")
      var d = new Date()
      var from = new Date(args[0])
      var to = new Date(args[1])
      return ((d >= from) && (d <= to))
    },
    "before": function (...args) {
      assert((args.length == 1), "before expects 1 arg")
      var d = new Date()
      var to = new Date(args[0])
      return (d <= to)
    },
    "after": function (...args) {
      assert((args.length == 1), "after expects 1 args")
      var d = new Date()
      var from = new Date(args[0])

      //console.log("Comparing ",d,from,(d>=from))

      return (d >= from)
    },
    "ingroup": function (...args) {
      return ((this.user.roles.filter(value => -1 !== args.indexOf(value))).length > 0) //list intersection https://stackoverflow.com/a/1885569
    },
    "ipcheck": function (...args) {
      return (ipRangeCheck(this.ip, args))
    },
  }

//====================================================================================================

var binaryOperators =
  {
    "+": (...args) => {
      assert((args.length == 2), "and expects 2 args")


      //console.log(args)

      if (args[0].type === 'Literal') args[0] = args[0].value
      if (args[1].type === 'Literal') args[1] = args[1].value
      //assert(typeof(args[0])===typeof(true),"and expects a boolean");
      //assert(typeof(args[1])===typeof(true),"and expects a boolean");
      return (args[0] + args[1])
    },
    "and": (...args) => {
      assert((args.length == 2), "and expects 2 args")
      if (args[0].type === 'Literal') args[0] = args[0].value
      if (args[1].type === 'Literal') args[1] = args[1].value
      assert(typeof (args[0]) === typeof (true), "and expects a boolean")
      assert(typeof (args[1]) === typeof (true), "and expects a boolean")
      return (args[0] && args[1])
    },
    "or": (...args) => {
      assert((args.length == 2), "and expects 2 args")
      if (args[0].type === 'Literal') args[0] = args[0].value
      if (args[1].type === 'Literal') args[1] = args[1].value
      assert(typeof (args[0]) === typeof (true), "or expects a boolean")
      assert(typeof (args[1]) === typeof (true), "or expects a boolean")
      return (args[0] || args[1])
    },
    "eq": (...args) => {
      assert((args.length == 2), "and expects 2 args")
      //console.log(args)
      //if(args[0].type==='Literal') args[0]=args[0].value
      //if(args[1].type==='Literal') args[1]=args[1].value
      //assert(typeof(args[0])===typeof(true),"or expects a boolean");
      //assert(typeof(args[1])===typeof(true),"or expects a boolean");
      try {
        assert.deepEqual(args[0], args[1])
        return true
      } catch (err) {
        return false
      }
    }

  }

//====================================================================================================

var unaryOperators =
  {
    "not": (...args) => {
      if (args[0].type === 'Literal') args[0] = args[0].value
      assert((args.length == 1), "not expects 1 arg")
      assert((typeof (args[0]) === typeof (true)), "not expects a boolean")
      return (!args[0])
    }
  }

//====================================================================================================


function evaltree(context, t) {


  if (t == null) return null

  if (t.left) t.left = evaltree(context, t.left)
  if (t.right) t.right = evaltree(context, t.right)
  if (t.argument) t.argument = evaltree(context, t.argument)	//annoyingly for unary args, there is one child under 'argument'. It should be under 'left'

  if (t.type == "CallExpression") {
    var name = t.callee.name
    if (functions[name] == undefined) throw "Unrecognised function:" + name


    var processedargs = t.arguments.map((x) => {
      return evaltree(context, x)
    })
    //console.log("Processed:",processedargs)

    return functions[name].apply(context, processedargs) //.map((x)=>{ return x.value }
  }

  if (t.type == "Literal") {
    return t.value
  }


  if (t.type == "ArrayExpression") {
    return t.elements.map((a) => {
      return evaltree(context, a)
    })
  }


  if (t.type == "ConditionalExpression") {
    //console.log(t)
    //console.log("test:",evaltree(context,t.test))
    var result = evaltree(context, t.test)
    if (result.type === 'Literal') result = result.value


    if (result === true) return evaltree(context, t.consequent)
    else return evaltree(context, t.alternate)
  }


  if (t.type == "BinaryExpression") {
    var name = t.operator
    if (binaryOperators[name] == undefined) throw "Unrecognised function:" + name
    else return binaryOperators[name].apply(context, [t.left, t.right])
  }


  if (t.type == "UnaryExpression") {
    var name = t.operator
    if (unaryOperators[name] == undefined) throw "Unrecognised function:" + name
    else return unaryOperators[name].apply(context, [t.argument])
  }


  //TODO: Fix this special case?
  if (t.type == "Identifier") {
    return t.name
  }


  if (t.type == "MemberExpression") {
    //var name=t.operator;
    //if(unaryOperators[name]==undefined) throw "Unrecognised function:"+name
    //else

    var n = t.property.name

    //console.log("Getting name of ",n)
    //console.log(t.object)
    //console.log("tree ",t)

    //need to get property n of t.object
    var e = null

    if (t.object.type == "Identifier") {
      if (t.object.name == "context") {
        e = context
        //console.log("reached context",context)
      } else throw "cannot access any objects ouside context"
    } else e = evaltree(context, t.object)
    if (e == null) return null


    if (e[n] == null) return evaltree(context, null)
    else {
      //console.log("returning ",e[n])
      return e[n]
    }
  }

  return t
}


var jp = require('jsonpath')


class ConstraintServiceProvider extends ServiceProvider {
  provides() {
    return ['server/constraints/api']
  }

  evalTree(context, tree) {
    if (tree == null) return null
    //console.log("sending:",tree)
    var matches = jp.nodes(tree, '$..eval')
    for (var n of matches) {
      var result
      var value = n.value

      if (Array.isArray(value)) value = value.join("\n")

      try {
        result = this.evalConstraint(context, value)
      } catch (err) {
        console.log(err)
        if (err.stopped === true) result = err.value
        else throw err
      }
      jp.value(tree, jp.stringify(n.path.slice(0, -1)), result)
    }


    return tree
  }

  evalConstraint(context, constraint, defaultval?) {
    if (constraint == null) return defaultval
    if ((constraint == false) || (constraint == true)) return constraint

    //console.log("CONST:",constraint)
    var parse_tree = jsep(constraint)
    var result = evaltree(context, parse_tree)

    //TODO: Why is this needed?
    if (result == null) return null
    if (result.value != null) return result.value

    return result
  }

  async init() {
    this.core.singleton('server/constraints/api', () => ({
      evalTree: (context, tree) => {
        return this.evalTree(context, tree)
      },
      evalConstraint: (context, constraint, defaultval?) => {
        return this.evalConstraint(context, constraint, defaultval)
      }
    }))
  }
}


module.exports = ConstraintServiceProvider








