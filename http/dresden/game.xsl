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
    <title>Game</title>
    <link href="drag.css" rel="stylesheet" type="text/css"/>
    <script src="drag.js" type="application/javascript"></script>
  </head>
  <body onload="init()">

  <xsl:for-each select="location">
    <div>
      <xsl:attribute name="id">
        <xsl:value-of select="@id" />
      </xsl:attribute>
	  <xsl:apply-templates select="src"/>
    </div>
  </xsl:for-each>

  </body>
  </html>

</xsl:template>

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
</xsl:template>

</xsl:stylesheet>

