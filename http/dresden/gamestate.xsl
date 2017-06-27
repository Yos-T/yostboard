<?xml version="1.0"?>

<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

<!-- <xsl:include href="game.xsl" /> -->

<xsl:output
     method="html"
     doctype-system="about:legacy-compat"
     encoding="UTF-8"
     indent="yes" />

<xsl:variable name="MAX_PIECE_NESTING">2</xsl:variable>

<!-- NOT COPY from game.xsl -->
<xsl:template match="face">
  <xsl:param name="active" />

  <div>
    <xsl:attribute name="class">face<xsl:if test="not(@name) or @name = $active"> active</xsl:if></xsl:attribute>
    <xsl:if test="@name">
      <xsl:attribute name="data-name"><xsl:value-of select="@name" /></xsl:attribute>
    </xsl:if>
    <xsl:choose>
    <xsl:when test="@type = 'image'">
      <img draggable="false">
      <xsl:attribute name="src">images/<xsl:value-of select="." /></xsl:attribute>
      </img>
    </xsl:when>
    <xsl:otherwise>
        ERROR face type unknown: <xsl:value-of select="@type" />
    </xsl:otherwise>
    </xsl:choose> 
  </div>
</xsl:template>

<xsl:template match="piece">
  <xsl:param name="x" />
  <xsl:param name="y" />
  <xsl:param name="face" />
  <xsl:param name="stackPiece" />
  <div>
    <xsl:attribute name="id"><xsl:value-of select="@id" /></xsl:attribute>
    <xsl:attribute name="class">piece <xsl:apply-templates select="key('basePiece', base)" mode="tags"/><xsl:value-of select="tags" /></xsl:attribute>
    <xsl:if test="$x and $y and $x!='' and $y!=''">
      <xsl:attribute name="style">top: <xsl:value-of select="$y" />px; left: <xsl:value-of select="$x" />px;</xsl:attribute>
    </xsl:if>
    <div class="faces" draggable="true">
      <xsl:apply-templates select="key('basePiece', base)" mode="faces">
        <xsl:with-param name="active" select="$face" />
      </xsl:apply-templates>
      <xsl:apply-templates select="face">
        <xsl:with-param name="active" select="$face" />
      </xsl:apply-templates>
    </div>
    <xsl:copy-of select="$stackPiece" />
  </div>
</xsl:template>

<xsl:key name="basePiece" match="basePiece" use="@id"/>

<xsl:template match="basePiece" mode="tags">
  <xsl:apply-templates select="key('basePiece', base)" mode="tags" />
  <xsl:value-of select="tags" />
  <xsl:text> </xsl:text><!-- Add space -->
</xsl:template>

<xsl:template match="basePiece" mode="faces">
  <xsl:param name="active" />
  <xsl:apply-templates select="key('basePiece', base)" mode="faces"> 
    <xsl:with-param name="active" select="$active" />
  </xsl:apply-templates>
  <xsl:apply-templates select="face">
    <xsl:with-param name="active" select="$active" />
  </xsl:apply-templates>
</xsl:template>

<!-- END COPY from game.xsl -->

<xsl:template match="gamestate">
  <xsl:param name="gamefile" select="@game"/> 
  <xsl:variable name="gamedoc" select="document($gamefile)"/>
  <html>
  <head>
    <xsl:apply-templates select="$gamedoc/game"/>
    <link href="css/drag.css" rel="stylesheet" type="text/css"/>
    <script type="application/javascript">var MAX_PIECE_NESTING = <xsl:value-of select="$MAX_PIECE_NESTING" />;</script>
    <script src="js/drag.js" type="application/javascript"></script>
  </head>
  <body onload="init()"> 
  <xsl:for-each select="location">
    <div>
      <xsl:attribute name="id"><xsl:value-of select="@id" /></xsl:attribute>
      <xsl:variable name="locid" select="@id" />
      <xsl:attribute name="class">location <xsl:value-of select="$gamedoc/game/location[@id=$locid]/@type" /></xsl:attribute>
        <div class="relativity">
          <xsl:apply-templates select="$gamedoc/game/location[@id=$locid]/face"/>
          <xsl:apply-templates select="pieceState">
            <xsl:with-param name="gamedoc" select="$gamedoc" />
          </xsl:apply-templates>
        </div>
    </div>
  </xsl:for-each>
  </body>
  </html>
</xsl:template>

<xsl:template match="game">
  <title>
    <xsl:value-of select="name" />
  </title>
  <link rel="stylesheet" type="text/css">
    <xsl:attribute name="href">css/<xsl:value-of select="@id" />.css</xsl:attribute>
  </link>
  <script type="application/javascript">
    <xsl:attribute name="src">js/<xsl:value-of select="@id" />.js</xsl:attribute>
  </script>
</xsl:template>

<xsl:key name="piece" match="piece" use="@id"/>

<xsl:template match="node()|@*">
  <xsl:copy>
    <xsl:apply-templates select="node()|@*"/>
  </xsl:copy>
</xsl:template>

<xsl:template match="pieceState/pieceState">
  <xsl:param name="gamedoc" />
  <xsl:param name="stackSize" />
  <xsl:variable name="id" select="@id" />
  <xsl:variable name="face" select="@face"/>

  <xsl:variable name="stack">
    <xsl:if test="position() &gt;= $stackSize - $MAX_PIECE_NESTING">
      <xsl:apply-templates select="following-sibling::*" >
        <xsl:with-param name="gamedoc" select="$gamedoc" />
        <xsl:with-param name="stackSize" select="$stackSize" />
      </xsl:apply-templates>
    </xsl:if>
  </xsl:variable>

  <xsl:for-each select="$gamedoc">
    <xsl:apply-templates select="key('piece', $id)" >
      <xsl:with-param name="face"><xsl:value-of select="$face" /></xsl:with-param>
      <xsl:with-param name="stackPiece" select="$stack" />
    </xsl:apply-templates>
  </xsl:for-each>
</xsl:template>

<xsl:template match="location/pieceState">
  <xsl:param name="gamedoc" />
  <xsl:variable name="id" select="@id" />
  <xsl:variable name="x" select="@x"/>
  <xsl:variable name="y" select="@y"/>
  <xsl:variable name="face" select="@face"/>
  <xsl:variable name="stackSize" select="count(pieceState) + 1" />

  <xsl:variable name="stack">
    <xsl:apply-templates select="pieceState[position() &lt;= $stackSize - $MAX_PIECE_NESTING]">
      <xsl:with-param name="gamedoc" select="$gamedoc" />
      <xsl:with-param name="stackSize"><xsl:value-of select="$stackSize" /></xsl:with-param>
    </xsl:apply-templates>
  </xsl:variable>

  <xsl:for-each select="$gamedoc">
    <xsl:apply-templates select="key('piece', $id)" > 
      <xsl:with-param name="x"><xsl:value-of select="$x" /></xsl:with-param>
      <xsl:with-param name="y"><xsl:value-of select="$y" /></xsl:with-param>
      <xsl:with-param name="face"><xsl:value-of select="$face" /></xsl:with-param>
      <xsl:with-param name="stackPiece" select="$stack" />
    </xsl:apply-templates>
  </xsl:for-each>
</xsl:template>

</xsl:stylesheet>

