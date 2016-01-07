<?xml version="1.0"?>

<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">

<xsl:output
     method="html"
     doctype-system="about:legacy-compat"
     encoding="UTF-8"
     indent="yes" />

<xsl:template match="/game">
  <html>
  <head>
    <title>
      <xsl:value-of select="name" />
    </title>
    <link href="css/drag.css" rel="stylesheet" type="text/css"/>
    <script src="js/drag.js" type="application/javascript"></script>
    <script src="js/init.js" type="application/javascript"></script>
  </head>
  <body onload="init()">

  <xsl:for-each select="location">
    <div>
      <xsl:attribute name="id">
        <xsl:value-of select="@id" />
      </xsl:attribute>
      <xsl:attribute name="class">
        location-<xsl:value-of select="@type" />
      </xsl:attribute>
	  <xsl:apply-templates select="src"/>
	  <xsl:apply-templates select="piece"/>
    </div>
  </xsl:for-each>

  </body>
  </html>

</xsl:template>
<!--
<xsl:attribute-set name="test">
        <xsl:attribute name="id">
        <xsl:value-of select="@id" />
      </xsl:attribute>
</xsl:attribute-set>
-->
<xsl:template match="src">
  <xsl:choose>
  <xsl:when test="@type = 'image'">
    <img>
	  <xsl:attribute name="src">
        images/<xsl:value-of select="." />
      </xsl:attribute>
    </img>
  </xsl:when>
  <xsl:otherwise>
      ERROR src type unknown: <xsl:value-of select="@type" />
  </xsl:otherwise>
  </xsl:choose> 
</xsl:template>

<xsl:template match="piece">
  <a draggable="true">
	<xsl:attribute name="id">
      <xsl:value-of select="@id" />
    </xsl:attribute>
	<xsl:attribute name="class">
      draggable <xsl:value-of select="class" />
    </xsl:attribute>
    <xsl:apply-templates select="src"/>
  </a>
</xsl:template>

</xsl:stylesheet>

