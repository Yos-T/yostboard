<?xml version="1.0"?>

<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:exsl="http://exslt.org/common" version="1.0">

<xsl:output
     method="html"
     doctype-system="about:legacy-compat"
     encoding="UTF-8"
     indent="yes" />

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

<xsl:template match="face">
  <div class="face">
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

<xsl:key name="pieceNode" match="piece" use="@id"/>

<xsl:template match="tmpHtmlPiece//node()|@*">
  <xsl:copy>
    <xsl:apply-templates select="node()|@*"/>
  </xsl:copy>
</xsl:template>

<!--<xsl:template match="tmpHtmlPiece/div[1]">-->
<xsl:template match="tmpHtmlPiece/div[contains(@class, 'piece')]">
  <xsl:param name="x" />
  <xsl:copy>
    <xsl:copy-of select="@*" />
    <xsl:attribute name="x"><xsl:value-of select="$x" /></xsl:attribute>
    <xsl:apply-templates select="node()|@*"/>
  </xsl:copy>
</xsl:template>

<xsl:template match="pieceState">
  <xsl:param name="gamedoc" />
  <xsl:variable name="id" select="@id" />
  <div NAME="STATE">
    <xsl:attribute name="id"><xsl:value-of select="@id" /></xsl:attribute>
    <!--<xsl:for-each select="$gamedoc/key('pieceNode', $id)">-->
<!--
    <xsl:for-each select="piece[@id]">
      bla 
    </xsl:for-each>
-->
<!--  <xsl:apply-templates select="$gamedoc//piece[@id=$id]" /> -->
    <xsl:variable name="bottomPiece">
      <xsl:for-each select="$gamedoc">
        <tmpHtmlPiece>
        <xsl:apply-templates select="key('pieceNode', $id)" />
        </tmpHtmlPiece>
      </xsl:for-each>
    </xsl:variable>

    <xsl:for-each select="exsl:node-set($bottomPiece)">
        <xsl:apply-templates ><xsl:with-param name="x">2222</xsl:with-param></xsl:apply-templates>
    </xsl:for-each>
<!--
    <xsl:apply-templates select="pieceState">
      <xsl:with-param name="gamedoc" select="$gamedoc" />
    </xsl:apply-templates>
-->
  end</div>
</xsl:template>

<xsl:key name="basePiece" match="/game/basePiece" use="@id"/>

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

</xsl:stylesheet>

