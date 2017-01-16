<?xml version="1.0"?>

<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

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
<!--
  <xsl:for-each select="location">
    <div>
      <xsl:attribute name="id"><xsl:value-of select="@id" /></xsl:attribute>
      <xsl:attribute name="class">location <xsl:value-of select="@type" /></xsl:attribute>
        <div class="relativity">
          <xsl:apply-templates select="face"/>
          <xsl:apply-templates select="piece"/>
        </div>
    </div>
  </xsl:for-each>
-->
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

<!--
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

<xsl:template match="piece">
  <div>
    <xsl:attribute name="id"><xsl:value-of select="@id" /></xsl:attribute>
    <xsl:variable name="base" select="@base" />
    <xsl:variable name="baseClass" select="/game/basePiece[@id=$base]/tags" />
    <xsl:attribute name="class">piece <xsl:value-of select="$baseClass" /><xsl:value-of select="tags" /></xsl:attribute>
    <div class="faces" draggable="true">
      <xsl:apply-templates select="/game/basePiece[@id=$base]/face" />
      <xsl:apply-templates select="face"/>
    </div>
  </div>
</xsl:template>
-->
</xsl:stylesheet>

