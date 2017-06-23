<?xml version="1.0"?>

<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">

<!-- <xsl:include href="game.xsl" /> -->

<xsl:output
     method="html"
     doctype-system="about:legacy-compat"
     encoding="UTF-8"
     indent="yes" />

<!-- COPY from game.xsl -->
  <xsl:template match="face">
    <div class="face">
      <xsl:attribute name="data-name"><xsl:value-of select="@name" /></xsl:attribute>
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
    <div>
      <xsl:attribute name="id"><xsl:value-of select="@id" /></xsl:attribute>
      <xsl:attribute name="class">piece <xsl:call-template name="getBaseTags"/><xsl:value-of select="tags" /></xsl:attribute>
      <div class="faces" draggable="true">
        <xsl:call-template name="getBaseFaces"/>
        <xsl:apply-templates select="face"/>
      </div>
    </div>
  </xsl:template>

  <xsl:key name="basePiece" match="basePiece" use="@id"/>

  <xsl:template name="getBaseTags">
    <xsl:if test="@base">
      <xsl:variable name="base" select="@base" />
      <xsl:for-each select="key('basePiece', $base)">
        <xsl:call-template name="getBaseTags"/>
      </xsl:for-each>
      <xsl:value-of select="/game/basePiece[@id=$base]/tags" />
      <xsl:text> </xsl:text><!-- Add space -->
    </xsl:if>
  </xsl:template>

  <xsl:template name="getBaseFaces">
    <xsl:if test="@base">
      <xsl:variable name="base" select="@base" />
      <xsl:for-each select="key('basePiece', $base)">
        <xsl:call-template name="getBaseFaces"/>
      </xsl:for-each>
      <xsl:apply-templates select="/game/basePiece[@id=$base]/face" />
    </xsl:if>
  </xsl:template>
<!-- END COPY from game.xsl -->


<xsl:template match="/gamestate">
  <xsl:param name="gamefile" select="@game"/> 
  <xsl:variable name="gamedoc" select="document($gamefile)"/>
  <html>
  <head>
    <xsl:apply-templates select="$gamedoc/game"/>
    <link href="css/drag.css" rel="stylesheet" type="text/css"/>
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

<xsl:key name="pieceNode" match="piece" use="@id"/>

<xsl:template match="tmpHtmlBottomPiece//node()|@*">
  <xsl:copy>
    <xsl:apply-templates select="node()|@*"/>
  </xsl:copy>
</xsl:template>

<!--<xsl:template match="tmpHtmlBottomPiece/div[1]">-->
<xsl:template match="tmpHtmlBottomPiece//div[contains(@class, 'piece')]">
  <xsl:param name="x" />
  <xsl:param name="y" />
  <xsl:copy>
    <xsl:copy-of select="@*" />
    <xsl:if test="$x and $y and $x!='' and $y!=''">
      <xsl:attribute name="style">top: <xsl:value-of select="$y" />px; left: <xsl:value-of select="$x" />px;</xsl:attribute>
    </xsl:if>
    <xsl:apply-templates select="node()|@*"/>
  </xsl:copy>
</xsl:template>

<!--
<xsl:template match="@*|node()">
  <xsl:copy>
    <xsl:apply-templates select="@*|node()"/>
  </xsl:copy>
</xsl:template>

<xsl:template match="tmpHtmlBottomPiece" />
-->

<xsl:template match="location/pieceState">
  <xsl:param name="gamedoc" />
  <xsl:variable name="id" select="@id" />
  <xsl:variable name="x" select="@x"/>
  <xsl:variable name="y" select="@y"/>

<!--  <xsl:apply-templates select="$gamedoc//piece[@id=$id]" /> -->
  <xsl:variable name="bottomPiece">
    <xsl:for-each select="$gamedoc">
      <tmpHtmlBottomPiece>
        <xsl:apply-templates select="key('pieceNode', $id)" />
      </tmpHtmlBottomPiece>
    </xsl:for-each>
  </xsl:variable>

  <xsl:variable name="stack">
      <tmpHtmlBottomPiece>
    <xsl:for-each select="pieceState">
      <xsl:variable name="nodeid" select="@id" />
      <xsl:for-each select="$gamedoc">
        <xsl:apply-templates select="key('pieceNode', $nodeid)" />
      </xsl:for-each>
    </xsl:for-each>
      </tmpHtmlBottomPiece>
  </xsl:variable>

  <xsl:variable name="bottom">
      <tmpHtmlBottomPiece>
    <xsl:for-each select="exsl:node-set($bottomPiece)">
      <xsl:apply-templates >
        <xsl:with-param name="x"><xsl:value-of select="111" /></xsl:with-param>
        <xsl:with-param name="y"><xsl:value-of select="222" /></xsl:with-param>
      </xsl:apply-templates>
    </xsl:for-each>
      </tmpHtmlBottomPiece>
  </xsl:variable>

  <xsl:for-each select="exsl:node-set($bottom)">
    <xsl:for-each select="tmpHtmlBottomPiece/*[1]">
      <xsl:copy>
        <xsl:apply-templates select="node()|@*" />
        <xsl:apply-templates select="exsl:node-set($stack)" />
      </xsl:copy>
    </xsl:for-each>
  </xsl:for-each>

<!--
  <xsl:call-template name="nest">
    <xsl:with-param name="parent"><xsl:value-of select="exsl:node-set($bottom)" /></xsl:with-param>
    <xsl:with-param name="child"><xsl:value-of select="$stack" /></xsl:with-param>
  </xsl:call-template>
-->
</xsl:template>

<!--
<xsl:template name="nest">
  <xsl:param name="parent" />
  <xsl:param name="child" />

xxx1
    <xsl:value-of select="$parent" />
ccc2

ppp1
    <xsl:copy-of select="exsl:node-set($parent)" />
ppp2


  <xsl:for-each select="exsl:node-set($parent)/.">
PPP1
    <xsl:copy-of select="exsl:node-set($parent)" />
BLA2
<xsl:value-of select="exsl:node-set($child)" />
    <xsl:copy>
      <xsl:copy-of select="@*" />
      <xsl:copy-of select="node()" />
      <xsl:value-of select="$child" />
    </xsl:copy>
  </xsl:for-each>
</xsl:template>
-->

</xsl:stylesheet>

