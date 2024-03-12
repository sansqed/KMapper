

export default function NLPTest(){
    // Load wink-nlp package.
    const winkNLP = require( 'wink-nlp' );
    // Load english language model — light version.
    const model = require( 'wink-eng-lite-web-model' );
    // Instantiate winkNLP.
    const nlp = winkNLP( model );
    // Obtain "its" helper to extract item properties.
    const its = nlp.its;
    // Obtain "as" reducer helper to reduce a collection.
    const as = nlp.as;
    
    const text = 'cats are cool';
    const doc = nlp.readDoc( text );
    console.log( doc.tokens().out( its.value) );
    // -> ["cats", "are", "cool"]
    console.log( doc.tokens().out( its.stopWordFlag ) );
    // -> [false, true, false]
    console.log( doc.tokens().out( its.pos ) );
    // -> ["NOUN", "AUX", "VERB"]
    console.log( doc.tokens().out( its.lemma ) );
    // -> ["cat", "be", "cool"]
}

export function docTest(text:string){
    // Load wink-nlp package.
    const winkNLP = require( 'wink-nlp' );
    // Load english language model — light version.
    const model = require( 'wink-eng-lite-web-model' );
    // Instantiate winkNLP.
    const nlp = winkNLP( model );
    // Obtain "its" helper to extract item properties.
    const its = nlp.its;
    // Obtain "as" reducer helper to reduce a collection.
    const as = nlp.as;

    const doc = nlp.readDoc( text );

    console.log({pos: doc.tokens().out( its.pos), val: doc.tokens().out( its.value)})
}