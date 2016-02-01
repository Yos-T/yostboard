function testLocation()
{
    var clone = document.getElementById( 'proto_location' ).cloneNode(true);
    clone.id = 'test_location';
    document.body.appendChild( clone );
    return clone;
}

function newPiece( id )
{
    var clone = document.getElementById( 'proto_piece' ).cloneNode(true);
    clone.id = id;
    return clone;
}

function doDetachStackTest( var numBefore, var numAfter )
{
    var prev = testLocation().firstElementChild; //relativity
    var so = document.createElememt('div');
    so.classList.append('stackOverflow');
    var idi = 0;
    for ( var b = 0; b < numBefore; b++ )
    {
        if ( idi+1 == MAX_PIECE_NESTING )
        {
            prev.appendChild( so );
            prev = so;
        }
        var p = newPiece( 't_' + idi++ );
        prev.appendChild( p );
        prev = p;
    }

    if ( idi+1 == MAX_PIECE_NESTING )
    {
        prev.appendChild( so );
        prev = so;
    }

    var p = newPiece( 'detach_target' );
    prev.appendChild( p );
    prev = p;
    
    for ( var a = 0; a < numAfter; a++ )
    {
        if ( idi+2 == MAX_PIECE_NESTING )
        {
            prev.appendChild( so );
            prev = so;
        }

        var p = newPiece( 't_' + idi++ );
        prev.appendChild( p );
        prev = p;
    }

    /* Detach the target */
    unfold( prev );
    var target = getDragPiece( 'detach_target' );
    test.value( checkTestLoaction( numBefore + numAfter ) ).is( numBefore + numAfter );
    test.isTrue( checkTestPiece( target ) );

    delTestLocation();
}

