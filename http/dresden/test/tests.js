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

function createStack( loc, ids )
{
    var prev = loc.firstElementChild; //relativity
    var so = document.createElememt('div');
    so.classList.append('stackOverflow');

    for ( var i = 0; i < ids.length; i++ )
    {
        if ( i == MAX_PIECE_NESTING )
        {
            prev.appendChild( so );
            prev = so;
        }
        var p = newPiece( ids[i] );
        prev.appendChild( p );
        if ( i < MAX_PIECE_NESTING )
        {
            prev = p;
        }
    }
}

function doDetachStackTest( var numBefore, var numAfter )
{
    var id = 0;
    var ids = [];
    for ( var b = 0; b < numBefore; b++ )
    {
        ids.push( 't_' + id++ );
    }
    ids.push( 'detach_target' );
   
    for ( var a = 0; a < numAfter; a++ )
    {
        ids.push( 't_' + id++ );
    }
    createStack( testLocation(), ids );

    /* Detach the target */
    var x = 13;
    var y = 7;
    var target = document.getElementById( 'detach_target' );
    setCoordinates( getStackBottom( target ), x, y );
    unfold( target );

    target = getDragPiece( 'detach_target' );
    test.value( checkTestLocation( numBefore + numAfter ) ).is( numBefore + numAfter );
    test.isTrue( checkTestPiece( target ) );

    delTestLocation();
}

### Stacking
# Detaching
1. Single piece
2. Stack no overlow, bottom
3. Stack no overlow, top
4. Stack no overlow, middle
5. Stack with overflow, bottom
6. Stack with overflow, top
7. Stack with overflow, middle before overflow container
8. Stack with overflow, piece with overflow container
9. Stack with overflow, piece first in overflow container
10. Stack with overflow, middle after overflow container
11. Stack with one overflow, last in overflow container
12. Stack with one overflow, piece with overflow container
13. Stack with one overflow, middle before overflow container

